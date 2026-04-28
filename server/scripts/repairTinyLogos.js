import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { cloudinary } from "../config/cloudinary.js";
import { connectDatabase } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const FLAG_DIMENSION = 16;
const MIN_GOOD_DIMENSION = 64;
const FETCH_TIMEOUT_MS = 12000;

const ensureTmpDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const withTimeout = async (resource, options = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(resource, {
      ...options,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Ai-Gyan-Logo-Repair/1.0",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getPngSize = (buffer) => {
  if (buffer.length >= 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  return null;
};

const getJpegSize = (buffer) => {
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let index = 2;
  while (index < buffer.length) {
    if (buffer[index] !== 0xff) {
      index += 1;
      continue;
    }

    const marker = buffer[index + 1];
    const length = buffer.readUInt16BE(index + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return {
        width: buffer.readUInt16BE(index + 7),
        height: buffer.readUInt16BE(index + 5),
      };
    }

    index += 2 + length;
  }

  return null;
};

const getGifSize = (buffer) => {
  if (buffer.length >= 10 && buffer.toString("ascii", 0, 3) === "GIF") {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  return null;
};

const getWebpSize = (buffer) => {
  if (buffer.length >= 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const type = buffer.toString("ascii", 12, 16);
    if (type === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
  }

  return null;
};

const getSvgSize = (buffer) => {
  const text = buffer.toString("utf8");
  if (!text.includes("<svg")) {
    return null;
  }

  const widthMatch = text.match(/\bwidth=["']?([\d.]+)(px)?["']?/i);
  const heightMatch = text.match(/\bheight=["']?([\d.]+)(px)?["']?/i);
  const viewBoxMatch = text.match(/\bviewBox=["'][^"']*\s([\d.]+)\s([\d.]+)["']/i);

  return {
    width: widthMatch ? Number(widthMatch[1]) : viewBoxMatch ? Number(viewBoxMatch[1]) : MIN_GOOD_DIMENSION,
    height: heightMatch ? Number(heightMatch[1]) : viewBoxMatch ? Number(viewBoxMatch[2]) : MIN_GOOD_DIMENSION,
    isSvg: true,
  };
};

const parseImageSize = (buffer) => getSvgSize(buffer) || getPngSize(buffer) || getJpegSize(buffer) || getGifSize(buffer) || getWebpSize(buffer);

const absolutize = (inputUrl, baseUrl) => {
  try {
    return new URL(inputUrl, baseUrl).toString();
  } catch {
    return "";
  }
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const extractCandidatesFromHtml = (html, baseUrl) => {
  const linkMatches = [...html.matchAll(/<link[^>]+(?:rel=["'][^"']*(?:icon|apple-touch-icon|mask-icon)[^"']*["'])[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) =>
    absolutize(match[1], baseUrl)
  );
  const metaMatches = [...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["'][^>]*>/gi)].map((match) =>
    absolutize(match[1], baseUrl)
  );

  const root = new URL(baseUrl).origin;
  const defaults = [
    `${root}/apple-touch-icon.png`,
    `${root}/apple-touch-icon-precomposed.png`,
    `${root}/android-chrome-512x512.png`,
    `${root}/android-chrome-192x192.png`,
    `${root}/favicon-512x512.png`,
    `${root}/favicon-256x256.png`,
    `${root}/favicon-196x196.png`,
    `${root}/favicon-192x192.png`,
    `${root}/favicon-180x180.png`,
    `${root}/favicon-96x96.png`,
    `${root}/favicon-64x64.png`,
    `${root}/favicon-48x48.png`,
    `${root}/favicon-32x32.png`,
    `${root}/favicon.svg`,
    `${root}/logo.svg`,
    `${root}/logo.png`,
  ];

  return unique([...linkMatches, ...metaMatches, ...defaults]);
};

const removeToolAndLogo = async (tool) => {
  if (tool.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(tool.image.publicId, { resource_type: "image" });
      console.log(`Removed old Cloudinary logo for ${tool.slug}: ${tool.image.publicId}`);
    } catch (error) {
      console.error(`Cloudinary delete failed for ${tool.slug}: ${error.message}`);
    }
  }

  await Tool.deleteOne({ _id: tool._id });
  console.log(`Removed tool without recoverable logo: ${tool.slug}`);
};

const uploadReplacementLogo = async (tool, sourceUrl) => {
  const tmpDir = path.resolve("tmp");
  ensureTmpDir(tmpDir);

  const extension = sourceUrl.includes(".svg") ? "svg" : sourceUrl.includes(".jpg") || sourceUrl.includes(".jpeg") ? "jpg" : "png";
  const tempFile = path.join(tmpDir, `${createSlug(tool.slug)}-repair.${extension}`);

  const response = await withTimeout(sourceUrl);
  if (!response.ok) {
    throw new Error(`logo fetch failed with ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(tempFile, buffer);
  const uploaded = await uploadToCloudinary(tempFile, "ai-gyan/tool-logos");
  fs.unlinkSync(tempFile);

  const previousPublicId = tool.image?.publicId;
  await Tool.updateOne(
    { _id: tool._id },
    {
      $set: {
        image: uploaded,
      },
    }
  );

  if (previousPublicId) {
    try {
      await cloudinary.uploader.destroy(previousPublicId, { resource_type: "image" });
      console.log(`Removed replaced Cloudinary logo for ${tool.slug}: ${previousPublicId}`);
    } catch (error) {
      console.error(`Failed to remove previous logo for ${tool.slug}: ${error.message}`);
    }
  }

  console.log(`Updated logo for ${tool.slug} from ${sourceUrl}`);
};

const findBetterLogo = async (tool) => {
  const pagesToTry = unique([tool.websiteUrl, (() => { try { return new URL(tool.websiteUrl).origin; } catch { return ""; } })()]);

  for (const pageUrl of pagesToTry) {
    try {
      const pageResponse = await withTimeout(pageUrl);
      if (!pageResponse.ok) {
        continue;
      }

      const html = await pageResponse.text();
      const candidates = extractCandidatesFromHtml(html, pageUrl);

      for (const candidate of candidates) {
        try {
          const assetResponse = await withTimeout(candidate);
          if (!assetResponse.ok) {
            continue;
          }

          const contentType = assetResponse.headers.get("content-type") || "";
          if (!contentType.startsWith("image/") && !candidate.endsWith(".svg")) {
            continue;
          }

          const buffer = Buffer.from(await assetResponse.arrayBuffer());
          const size = parseImageSize(buffer);
          if (!size) {
            continue;
          }

          if (size.isSvg || (size.width >= MIN_GOOD_DIMENSION && size.height >= MIN_GOOD_DIMENSION)) {
            return candidate;
          }
        } catch {
          // keep trying other candidates
        }
      }
    } catch {
      // keep trying other page variants
    }
  }

  return null;
};

const recalculateCategoryCounts = async () => {
  const counts = await Tool.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(counts.map((entry) => [entry._id, entry.count]));
  const categories = await Category.find({}, "name");

  await Promise.all(
    categories.map((category) =>
      Category.updateOne(
        { _id: category._id },
        {
          $set: {
            toolCount: countMap.get(category.name) || 0,
          },
        }
      )
    )
  );
};

const run = async () => {
  await connectDatabase();

  const tools = await Tool.find({}, "name slug websiteUrl image.publicId").lean();
  const toolByPublicId = new Map();
  for (const tool of tools) {
    if (tool.image?.publicId) {
      toolByPublicId.set(tool.image.publicId, tool);
    }
  }

  const resources = [];
  let nextCursor;
  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "ai-gyan/tool-logos",
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);

  const flagged = resources
    .filter((resource) => toolByPublicId.has(resource.public_id))
    .filter((resource) => resource.width <= FLAG_DIMENSION || resource.height <= FLAG_DIMENSION)
    .map((resource) => ({
      ...toolByPublicId.get(resource.public_id),
      resourceWidth: resource.width,
      resourceHeight: resource.height,
    }));

  console.log(`Found ${flagged.length} tiny-logo tools to repair.`);

  for (const tool of flagged) {
    const betterLogo = await findBetterLogo(tool);

    if (betterLogo) {
      try {
        await uploadReplacementLogo(tool, betterLogo);
        continue;
      } catch (error) {
        console.error(`Logo update failed for ${tool.slug}: ${error.message}`);
      }
    }

    await removeToolAndLogo(tool);
  }

  await recalculateCategoryCounts();
  console.log("Category counts recalculated.");
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Tiny logo repair failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
