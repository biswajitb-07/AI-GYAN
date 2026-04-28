import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";
import { Category } from "../models/Category.js";
import { Tool } from "../models/Tool.js";
import { createSlug } from "../utils/createSlug.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const importantToolsToAdd = [
  {
    name: "Windsurf",
    websiteUrl: "https://windsurf.com/",
    category: "Coding",
    pricing: "Free",
    description: "Agentic AI IDE for coding with local and cloud agents, context-aware editing, previews, and deployment workflows.",
    longDescription:
      "Windsurf is a next-generation AI coding environment built for developers who want deep codebase context, agent workflows, and faster shipping. It combines editor-native assistance with cloud agents, supports modern integrations, and is designed for day-to-day software development at serious scale.",
    tags: ["AI IDE", "Coding", "Agentic", "Developer Tools"],
    monthlyVisits: "1M+",
    featured: true,
    logoCandidates: [
      "https://www.google.com/s2/favicons?domain=windsurf.com&sz=256",
      "https://windsurf.com/favicon.ico",
      "https://unavatar.io/windsurf.com",
    ],
  },
  {
    name: "Bolt.new",
    websiteUrl: "https://bolt.new/",
    category: "Coding",
    pricing: "Free",
    description: "AI builder for websites, apps, and prototypes with built-in hosting, databases, and strong visual workflows.",
    longDescription:
      "Bolt.new helps teams turn ideas into working apps and websites through chat-driven building. It combines AI-assisted generation with hosting, data, and deployment capabilities so founders, designers, and developers can move from concept to product much faster.",
    tags: ["App Builder", "Website Builder", "AI Coding", "Prototyping"],
    monthlyVisits: "100K+",
    featured: true,
    logoCandidates: [
      "https://www.google.com/s2/favicons?domain=bolt.new&sz=256",
      "https://bolt.new/favicon.ico",
      "https://unavatar.io/bolt.new",
    ],
  },
  {
    name: "Lovable",
    websiteUrl: "https://lovable.dev/",
    category: "Coding",
    pricing: "Free",
    description: "Chat-based app and website builder with collaborative workflows, cloud features, and direct code editing.",
    longDescription:
      "Lovable is an AI product builder focused on fast app creation through natural language. It combines prompt-based generation, collaboration, cloud features, and code editing so individuals and teams can go from rough idea to production-ready experience with less setup friction.",
    tags: ["Vibe Coding", "App Builder", "Collaboration", "AI Coding"],
    monthlyVisits: "100K+",
    featured: true,
    logoCandidates: [
      "https://www.google.com/s2/favicons?domain=lovable.dev&sz=256",
      "https://lovable.dev/favicon.ico",
      "https://unavatar.io/lovable.dev",
    ],
  },
  {
    name: "Manus",
    websiteUrl: "https://manus.im/",
    category: "Productivity",
    pricing: "Free",
    description: "General AI agent for research, analysis, planning, and multi-step task execution across business workflows.",
    longDescription:
      "Manus positions itself as a general AI agent that can move beyond chat into action-oriented work. It is suited for teams looking to automate research, execution, and high-context workflows where an agent needs to plan, act, and deliver usable outcomes.",
    tags: ["AI Agent", "Research", "Automation", "Productivity"],
    monthlyVisits: "100K+",
    featured: true,
    logoCandidates: [
      "https://www.google.com/s2/favicons?domain=manus.im&sz=256",
      "https://manus.im/favicon.ico",
      "https://unavatar.io/manus.im",
    ],
  },
  {
    name: "Grok",
    websiteUrl: "https://grok.com/",
    category: "Research",
    pricing: "Free",
    description: "xAI's consumer AI assistant for web and mobile with reasoning, search, multimodal input, and API ecosystem support.",
    longDescription:
      "Grok is xAI's flagship assistant and model family, available on the web, mobile, and through developer APIs. It is positioned as a truth-seeking AI product with strong reasoning, search access, and multimodal capabilities for research, productivity, and general assistance.",
    tags: ["AI Assistant", "Research", "Search", "LLM"],
    monthlyVisits: "1M+",
    featured: true,
    logoCandidates: [
      "https://www.google.com/s2/favicons?domain=grok.com&sz=256",
      "https://grok.com/favicon.ico",
      "https://unavatar.io/grok.com",
    ],
  },
];

const lowValueSlugsToRemove = [
  "webchatgpt",
  "youtube-summary-with-chatgpt",
  "chatgpt-prompt-genius",
  "chatgpt-for-search-engines",
  "ai-character-for-gpt",
  "vall-e-x",
  "musiclm",
  "desksense",
  "gajix",
  "vizologi",
  "keyword-discovery",
];

const ensureTmpDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const downloadImage = async (url, destination) => {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Ai-Gyan-Curation/1.0",
    },
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new Error(`Failed image download from ${url}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, buffer);
};

const uploadFirstWorkingLogo = async (toolName, logoCandidates) => {
  const tmpDir = path.resolve("tmp");
  ensureTmpDir(tmpDir);

  for (const [index, candidate] of logoCandidates.entries()) {
    const tempFile = path.join(tmpDir, `${createSlug(toolName)}-${index}.png`);

    try {
      await downloadImage(candidate, tempFile);
      const uploaded = await uploadToCloudinary(tempFile, "ai-gyan/tool-logos");
      fs.unlinkSync(tempFile);
      return uploaded;
    } catch (error) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      console.warn(`Logo candidate failed for ${toolName}: ${candidate} :: ${error.message}`);
    }
  }

  throw new Error(`No working logo candidate found for ${toolName}`);
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

const removeToolAndLogo = async (tool) => {
  if (tool.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(tool.image.publicId, {
        resource_type: "image",
      });
      console.log(`Removed Cloudinary logo: ${tool.image.publicId}`);
    } catch (error) {
      console.error(`Failed Cloudinary removal for ${tool.slug}: ${error.message}`);
    }
  }

  await Tool.deleteOne({ _id: tool._id });
  console.log(`Removed tool: ${tool.slug} (${tool.name})`);
};

const addImportantTool = async (entry) => {
  const slug = createSlug(entry.name);
  const existing = await Tool.findOne({
    $or: [{ slug }, { websiteUrl: entry.websiteUrl }],
  });

  if (existing) {
    console.log(`Skipped existing tool: ${entry.name} -> ${existing.slug}`);
    return;
  }

  const image = await uploadFirstWorkingLogo(entry.name, entry.logoCandidates);
  const payload = {
    name: entry.name,
    slug,
    description: entry.description,
    longDescription: entry.longDescription,
    category: entry.category,
    pricing: entry.pricing,
    featured: entry.featured,
    websiteUrl: entry.websiteUrl,
    image,
    tags: entry.tags,
    monthlyVisits: entry.monthlyVisits,
    rating: 4.8,
    reviews: [],
  };

  await Tool.create(payload);
  console.log(`Added tool: ${entry.name} (${slug})`);
};

const run = async () => {
  await connectDatabase();

  const removalTargets = await Tool.find({ slug: { $in: lowValueSlugsToRemove } }).select("name slug image");
  console.log(`Removing ${removalTargets.length} low-value tools...`);

  for (const tool of removalTargets) {
    await removeToolAndLogo(tool);
  }

  console.log(`Adding curated market leaders...`);
  for (const entry of importantToolsToAdd) {
    await addImportantTool(entry);
  }

  await recalculateCategoryCounts();
  console.log("Category counts recalculated.");
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Market curation failed", error);
  await mongoose.connection.close();
  process.exit(1);
});
