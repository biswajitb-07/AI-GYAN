import fs from "fs/promises";
import path from "path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
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

const getApiBaseUrl = async () => {
  const localEnv = await readLocalEnv();
  const candidates = [
    process.env.VITE_API_BASE_URL,
    localEnv.VITE_API_BASE_URL,
    process.env.API_BASE_URL,
    `${baseSiteUrl}/api`,
    "http://localhost:5000/api",
  ]
    .filter(Boolean)
    .map((value) => String(value).replace(/\/+$/, ""));

  for (const candidate of [...new Set(candidates)]) {
    try {
      const response = await fetch(`${candidate}/health`, {
        headers: {
          accept: "application/json",
          "user-agent": "AI-Gyan-Prerender/1.0",
        },
      });

      if (response.ok) {
        return candidate;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
};

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "AI-Gyan-Prerender/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.json();
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

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clamp = (value = "", limit = 160) => {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  return normalized.length <= limit ? normalized : `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
};

const absoluteUrl = (value = "/") => (String(value).startsWith("http") ? String(value) : `${baseSiteUrl}${value}`);

const renderMetaTags = ({ title, description, canonicalPath, image, type = "website" }) => {
  const canonicalUrl = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(image || "/logo.png");
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return `    <title>${safeTitle}</title>
    <meta
      name="description"
      content="${safeDescription}"
    />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <meta property="og:site_name" content="Ai Gyan" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`;
};

const renderWebSiteSchema = ({ title, description, canonicalPath }) =>
  `<script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: absoluteUrl(canonicalPath),
        isPartOf: {
          "@type": "WebSite",
          name: "Ai Gyan",
          url: `${baseSiteUrl}/`,
        },
      })}
    </script>`;

const renderToolSchema = (tool) =>
  `<script type="application/ld+json">
      ${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.category,
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          category: tool.pricing,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: Number(tool.rating || 4.7),
          reviewCount: Array.isArray(tool.reviews) && tool.reviews.length ? tool.reviews.length : 1,
        },
        description: clamp(tool.longDescription || tool.description, 500),
        image: absoluteUrl(tool.image?.url || "/logo.png"),
        url: absoluteUrl(`/tools/${tool.slug}`),
      })}
    </script>`;

const renderBaseStyles = () =>
  `<style>
      :root {
        color-scheme: dark;
        font-family: "Segoe UI", system-ui, sans-serif;
      }

      body {
        margin: 0;
        background: #020617;
        color: #e2e8f0;
      }

      .seo-shell {
        max-width: 1080px;
        margin: 0 auto;
        padding: 56px 20px 80px;
      }

      .seo-card {
        border: 1px solid rgba(148, 163, 184, 0.18);
        background: rgba(15, 23, 42, 0.7);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(2, 6, 23, 0.28);
      }

      .seo-grid {
        display: grid;
        gap: 16px;
      }

      .seo-list {
        display: grid;
        gap: 12px;
        padding: 0;
        margin: 20px 0 0;
        list-style: none;
      }

      .seo-pill {
        display: inline-block;
        margin: 6px 8px 0 0;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(56, 189, 248, 0.2);
        background: rgba(14, 165, 233, 0.1);
        color: #bae6fd;
        font-size: 14px;
      }

      .seo-kicker {
        color: #67e8f9;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 12px;
        font-weight: 700;
      }

      .seo-title {
        margin: 12px 0;
        color: #f8fafc;
        font-size: clamp(32px, 5vw, 52px);
        line-height: 1.05;
      }

      .seo-copy {
        color: #cbd5e1;
        line-height: 1.75;
        font-size: 16px;
      }

      .seo-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
        color: #bae6fd;
        font-size: 14px;
      }

      .seo-link {
        color: #7dd3fc;
      }

      @media (min-width: 760px) {
        .seo-grid.cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .seo-grid.cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    </style>`;

const renderHomeContent = ({ categories, tools }) => `
  <div class="seo-shell">
    <section class="seo-card">
      <p class="seo-kicker">AI Tool Directory</p>
      <h1 class="seo-title">Discover AI tools for writing, coding, design, productivity, research, and more.</h1>
      <p class="seo-copy">
        Ai Gyan helps users compare curated AI tools by use case, pricing, category, and workflow fit. Browse popular tools,
        explore trusted categories, and move from discovery to decision faster.
      </p>
      <div class="seo-meta">
        <span>Curated tool discovery</span>
        <span>Category-first navigation</span>
        <span>Pricing and review context</span>
      </div>
    </section>
    <section class="seo-grid cols-2" style="margin-top: 18px;">
      <article class="seo-card">
        <h2>Popular categories</h2>
        <div>
          ${categories
            .slice(0, 12)
            .map((category) => `<span class="seo-pill">${escapeHtml(category.name)}${category.toolCount ? ` · ${category.toolCount} tools` : ""}</span>`)
            .join("")}
        </div>
      </article>
      <article class="seo-card">
        <h2>Trending tools</h2>
        <ul class="seo-list">
          ${tools
            .slice(0, 6)
            .map(
              (tool) => `<li>
                <strong>${escapeHtml(tool.name)}</strong><br />
                <span class="seo-copy">${escapeHtml(clamp(tool.description, 120))}</span>
              </li>`
            )
            .join("")}
        </ul>
      </article>
    </section>
  </div>`;

const renderStaticContent = ({ title, eyebrow, description, bullets = [] }) => `
  <div class="seo-shell">
    <section class="seo-card">
      <p class="seo-kicker">${escapeHtml(eyebrow)}</p>
      <h1 class="seo-title">${escapeHtml(title)}</h1>
      <p class="seo-copy">${escapeHtml(description)}</p>
      ${
        bullets.length
          ? `<ul class="seo-list">
              ${bullets.map((item) => `<li class="seo-copy">${escapeHtml(item)}</li>`).join("")}
            </ul>`
          : ""
      }
    </section>
  </div>`;

const renderCategoryContent = ({ category, tools }) => `
  <div class="seo-shell">
    <section class="seo-card">
      <p class="seo-kicker">Category Page</p>
      <h1 class="seo-title">${escapeHtml(category.name)} AI Tools</h1>
      <p class="seo-copy">${escapeHtml(category.description)}</p>
      <div class="seo-meta">
        <span>${category.toolCount || tools.length} tools listed</span>
        <span>Use-case focused directory</span>
      </div>
    </section>
    <section class="seo-card" style="margin-top: 18px;">
      <h2>Featured tools in ${escapeHtml(category.name)}</h2>
      <ul class="seo-list">
        ${tools
          .slice(0, 12)
          .map(
            (tool) => `<li>
              <strong>${escapeHtml(tool.name)}</strong><br />
              <span class="seo-copy">${escapeHtml(clamp(tool.description, 140))}</span>
            </li>`
          )
          .join("")}
      </ul>
    </section>
  </div>`;

const renderToolContent = (tool) => `
  <div class="seo-shell">
    <section class="seo-card">
      <p class="seo-kicker">AI Tool Review</p>
      <h1 class="seo-title">${escapeHtml(tool.name)}</h1>
      <p class="seo-copy">${escapeHtml(tool.longDescription || tool.description)}</p>
      <div class="seo-meta">
        <span>Category: ${escapeHtml(tool.category)}</span>
        <span>Pricing: ${escapeHtml(tool.pricing)}</span>
        <span>Rating: ${escapeHtml(String(tool.rating || 4.7))}/5</span>
        <span>Monthly visits: ${escapeHtml(tool.monthlyVisits || "N/A")}</span>
      </div>
      <p class="seo-copy" style="margin-top: 18px;">
        Official website:
        <a class="seo-link" href="${escapeHtml(tool.websiteUrl)}" rel="noreferrer">${escapeHtml(tool.websiteUrl)}</a>
      </p>
      <div style="margin-top: 14px;">
        ${(tool.tags || []).slice(0, 10).map((tag) => `<span class="seo-pill">${escapeHtml(tag)}</span>`).join("")}
      </div>
    </section>
  </div>`;

const updateHead = (template, metaMarkup, schemaMarkup = "") => {
  let next = template;

  next = next.replace(/<title>[\s\S]*?<\/title>/i, "");
  next = next.replace(/<meta[\s\S]*?name="description"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?name="robots"[\s\S]*?>/i, "");
  next = next.replace(/<link[\s\S]*?rel="canonical"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:site_name"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:title"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:description"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:type"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:url"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?property="og:image"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?name="twitter:card"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?name="twitter:title"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?name="twitter:description"[\s\S]*?>/i, "");
  next = next.replace(/<meta[\s\S]*?name="twitter:image"[\s\S]*?>/i, "");
  next = next.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, "");

  return next.replace("</head>", `${metaMarkup}\n${renderBaseStyles()}\n    ${schemaMarkup}\n  </head>`);
};

const updateRoot = (template, content) =>
  template.replace('<div id="root"></div>', `<div id="root">${content}</div>`);

const writeRouteHtml = async ({ routePath, html }) => {
  const trimmedPath = String(routePath || "/").replace(/^\/+|\/+$/g, "");
  const outputDir = trimmedPath ? path.join(distDir, trimmedPath) : distDir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
};

const buildRouteHtml = ({ template, meta, schema, content }) => updateRoot(updateHead(template, renderMetaTags(meta), schema), content);

const buildPrerender = async () => {
  const apiBaseUrl = await getApiBaseUrl();
  const template = await fs.readFile(path.join(distDir, "index.html"), "utf8");
  let tools = [];
  let categories = [];
  let categoryPages = [];

  if (apiBaseUrl) {
    try {
      [tools, categories] = await Promise.all([
        getPaginatedCollection(apiBaseUrl, "/tools?sort=popular"),
        fetchJson(`${apiBaseUrl}/categories?limit=200`).then((response) => response?.data || []),
      ]);

      categoryPages = await Promise.all(
        categories
          .filter((category) => category?.slug)
          .map(async (category) => {
            const response = await fetchJson(`${apiBaseUrl}/categories/${category.slug}?limit=12&page=1`);
            return {
              category,
              tools: response?.data?.tools || [],
            };
          })
      );
    } catch (error) {
      console.warn(`Could not fetch dynamic prerender data from ${apiBaseUrl}. Falling back to static pages only.`, error.message);
      tools = [];
      categories = [];
      categoryPages = [];
    }
  } else {
    console.warn("Could not reach any API endpoint. Falling back to static pages only.");
  }

  const staticRoutes = [
    {
      routePath: "/",
      meta: {
        title: "Ai Gyan | Discover AI Tools",
        description: "Discover curated AI tools for writing, coding, design, productivity, research, and more on Ai Gyan.",
        canonicalPath: "/",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "Ai Gyan | Discover AI Tools",
        description: "Discover curated AI tools for writing, coding, design, productivity, research, and more on Ai Gyan.",
        canonicalPath: "/",
      }),
      content: renderHomeContent({ categories, tools }),
    },
    {
      routePath: "/tools",
      meta: {
        title: "AI Tools Directory, Reviews and Pricing | Ai Gyan",
        description: "Browse the Ai Gyan AI tools directory by category, pricing, popularity, and workflow fit.",
        canonicalPath: "/tools",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "AI Tools Directory, Reviews and Pricing | Ai Gyan",
        description: "Browse the Ai Gyan AI tools directory by category, pricing, popularity, and workflow fit.",
        canonicalPath: "/tools",
      }),
      content: renderStaticContent({
        eyebrow: "Tool Directory",
        title: "Browse AI tools by category, pricing, and workflow.",
        description:
          "Explore the Ai Gyan directory to compare AI tools across writing, coding, design, productivity, automation, research, and other categories.",
        bullets: tools.slice(0, 10).map((tool) => `${tool.name}: ${clamp(tool.description, 100)}`),
      }),
    },
    {
      routePath: "/blog",
      meta: {
        title: "AI Blog and Updates | Ai Gyan",
        description: "Read AI updates, product notes, and curated insights from Ai Gyan.",
        canonicalPath: "/blog",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "AI Blog and Updates | Ai Gyan",
        description: "Read AI updates, product notes, and curated insights from Ai Gyan.",
        canonicalPath: "/blog",
      }),
      content: renderStaticContent({
        eyebrow: "Blog",
        title: "AI updates, practical notes, and curated signals.",
        description:
          "Ai Gyan highlights practical AI developments, tool updates, and category-level insights to help readers discover useful products faster.",
      }),
    },
    {
      routePath: "/pricing",
      meta: {
        title: "Pricing and Plans | Ai Gyan",
        description: "Explore Ai Gyan pricing information and how the platform organizes AI tool discovery.",
        canonicalPath: "/pricing",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "Pricing and Plans | Ai Gyan",
        description: "Explore Ai Gyan pricing information and how the platform organizes AI tool discovery.",
        canonicalPath: "/pricing",
      }),
      content: renderStaticContent({
        eyebrow: "Pricing",
        title: "Pricing guidance for discovering the right AI stack.",
        description:
          "Ai Gyan helps users understand whether tools are free, trial-based, or paid, making it easier to shortlist products before visiting their official sites.",
      }),
    },
    {
      routePath: "/about",
      meta: {
        title: "About Ai Gyan",
        description: "Learn about Ai Gyan and how it curates AI tools for discovery, comparison, and faster decisions.",
        canonicalPath: "/about",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "About Ai Gyan",
        description: "Learn about Ai Gyan and how it curates AI tools for discovery, comparison, and faster decisions.",
        canonicalPath: "/about",
      }),
      content: renderStaticContent({
        eyebrow: "About",
        title: "Ai Gyan is built to make AI tool discovery easier.",
        description:
          "The platform organizes AI tools around real workflows so users can compare categories, pricing, and use cases without opening dozens of tabs.",
      }),
    },
    {
      routePath: "/contact",
      meta: {
        title: "Contact Ai Gyan",
        description: "Contact Ai Gyan to suggest a tool, report an issue, or ask about a listing.",
        canonicalPath: "/contact",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "Contact Ai Gyan",
        description: "Contact Ai Gyan to suggest a tool, report an issue, or ask about a listing.",
        canonicalPath: "/contact",
      }),
      content: renderStaticContent({
        eyebrow: "Contact",
        title: "Suggest a tool or report a listing issue.",
        description:
          "Ai Gyan accepts tool suggestions, listing corrections, and ownership update requests so the directory stays useful and current.",
      }),
    },
    {
      routePath: "/privacy-policy",
      meta: {
        title: "Privacy Policy | Ai Gyan",
        description: "Read the Ai Gyan privacy policy for information on data handling and platform usage.",
        canonicalPath: "/privacy-policy",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "Privacy Policy | Ai Gyan",
        description: "Read the Ai Gyan privacy policy for information on data handling and platform usage.",
        canonicalPath: "/privacy-policy",
      }),
      content: renderStaticContent({
        eyebrow: "Privacy",
        title: "Privacy and data handling for Ai Gyan users.",
        description:
          "This page explains how Ai Gyan handles data, analytics, and related platform information when users browse the AI tools directory.",
      }),
    },
    {
      routePath: "/terms",
      meta: {
        title: "Terms and Conditions | Ai Gyan",
        description: "Review the Ai Gyan terms and conditions for directory usage and listing expectations.",
        canonicalPath: "/terms",
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: "Terms and Conditions | Ai Gyan",
        description: "Review the Ai Gyan terms and conditions for directory usage and listing expectations.",
        canonicalPath: "/terms",
      }),
      content: renderStaticContent({
        eyebrow: "Terms",
        title: "Terms for using the Ai Gyan directory.",
        description:
          "These terms explain how the Ai Gyan platform, listings, and directory content should be used by visitors and product owners.",
      }),
    },
  ];

  for (const route of staticRoutes) {
    const html = buildRouteHtml({
      template,
      meta: route.meta,
      schema: route.schema,
      content: route.content,
    });
    await writeRouteHtml({ routePath: route.routePath, html });
  }

  for (const page of categoryPages) {
    const html = buildRouteHtml({
      template,
      meta: {
        title: `${page.category.name} AI Tools, Reviews and Pricing | Ai Gyan`,
        description: clamp(page.category.description || `Explore ${page.category.name} AI tools on Ai Gyan.`, 155),
        canonicalPath: `/categories/${page.category.slug}`,
        image: "/logo.png",
      },
      schema: renderWebSiteSchema({
        title: `${page.category.name} AI Tools, Reviews and Pricing | Ai Gyan`,
        description: clamp(page.category.description || `Explore ${page.category.name} AI tools on Ai Gyan.`, 155),
        canonicalPath: `/categories/${page.category.slug}`,
      }),
      content: renderCategoryContent(page),
    });

    await writeRouteHtml({
      routePath: `/categories/${page.category.slug}`,
      html,
    });
  }

  for (const tool of tools.filter((entry) => entry?.slug)) {
    const description = clamp(
      tool.description || tool.longDescription || `Explore ${tool.name} with pricing, features, reviews, and category context on Ai Gyan.`,
      155
    );

    const html = buildRouteHtml({
      template,
      meta: {
        title: `${tool.name} Review, Pricing, Features and Alternatives | Ai Gyan`,
        description,
        canonicalPath: `/tools/${tool.slug}`,
        image: tool.image?.url || "/logo.png",
        type: "article",
      },
      schema: renderToolSchema(tool),
      content: renderToolContent(tool),
    });

    await writeRouteHtml({
      routePath: `/tools/${tool.slug}`,
      html,
    });
  }

  console.log(
    `Generated prerendered HTML for ${staticRoutes.length} static pages, ${categoryPages.length} categories, and ${
      tools.filter((tool) => tool?.slug).length
    } tools`
  );
};

buildPrerender().catch((error) => {
  console.error("Failed to generate prerendered HTML", error);
  process.exit(1);
});
