import fs from "fs/promises";
import path from "path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const envFilePath = path.join(rootDir, ".env");
const baseSiteUrl = (process.env.SITE_URL || "https://aigyan.online").replace(/\/+$/, "");

const readLocalEnv = async () => {
  try {
    const file = await fs.readFile(envFilePath, "utf8");

    return file.split(/\r?\n/).reduce((accumulator, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return accumulator;
      }

      const [key, ...rest] = trimmed.split("=");
      accumulator[key] = rest.join("=").trim();
      return accumulator;
    }, {});
  } catch {
    return {};
  }
};

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const formatDate = (value = new Date()) => new Date(value).toISOString().slice(0, 10);

const createUrlEntry = ({ loc, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "AI-Gyan-Sitemap/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
};

const getApiBaseUrl = async () => {
  if (process.env.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL.replace(/\/+$/, "");
  }

  const localEnv = await readLocalEnv();
  return String(localEnv.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/+$/, "");
};

const getPaginatedCollection = async (apiBaseUrl, endpoint) => {
  const firstPage = await fetchJson(`${apiBaseUrl}${endpoint}${endpoint.includes("?") ? "&" : "?"}page=1&limit=200`);
  const pages = Number(firstPage?.pagination?.pages || 1);
  const items = [...(firstPage?.data || [])];

  for (let page = 2; page <= pages; page += 1) {
    const response = await fetchJson(`${apiBaseUrl}${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}&limit=200`);
    items.push(...(response?.data || []));
  }

  return items;
};

const buildSitemap = async () => {
  const apiBaseUrl = await getApiBaseUrl();
  const [tools, categories] = await Promise.all([
    getPaginatedCollection(apiBaseUrl, "/tools?sort=az"),
    fetchJson(`${apiBaseUrl}/categories?limit=200`).then((response) => response?.data || []),
  ]);

  const staticPages = [
    { loc: `${baseSiteUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${baseSiteUrl}/tools`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseSiteUrl}/blog`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseSiteUrl}/pricing`, changefreq: "weekly", priority: "0.7" },
    { loc: `${baseSiteUrl}/about`, changefreq: "monthly", priority: "0.6" },
    { loc: `${baseSiteUrl}/contact`, changefreq: "monthly", priority: "0.6" },
    { loc: `${baseSiteUrl}/privacy-policy`, changefreq: "yearly", priority: "0.4" },
    { loc: `${baseSiteUrl}/terms`, changefreq: "yearly", priority: "0.4" },
  ];

  const toolPages = tools
    .filter((tool) => tool?.slug)
    .map((tool) => ({
      loc: `${baseSiteUrl}/tools/${tool.slug}`,
      lastmod: tool.updatedAt || tool.createdAt || new Date(),
      changefreq: "weekly",
      priority: "0.8",
    }));

  const categoryPages = categories
    .filter((category) => category?.slug)
    .map((category) => ({
      loc: `${baseSiteUrl}/categories/${category.slug}`,
      lastmod: category.updatedAt || category.createdAt || new Date(),
      changefreq: "weekly",
      priority: "0.7",
    }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoryPages, ...toolPages].map(createUrlEntry).join("\n")}
</urlset>
`;

  await fs.mkdir(publicDir, { recursive: true });
  await fs.writeFile(path.join(publicDir, "sitemap.xml"), xml, "utf8");
  console.log(`Generated sitemap with ${staticPages.length + categoryPages.length + toolPages.length} URLs`);
};

buildSitemap().catch((error) => {
  console.error("Failed to generate sitemap", error);
  process.exit(1);
});
