const FETCH_TIMEOUT_MS = 12000;
const brokenStatusCodes = new Set([410]);
const reviewStatusCodes = new Set([401, 403, 404, 429, 451, 500, 502, 503, 504, 521, 522, 523, 524, 525]);

const strongParkedSignals = [
  "domain for sale",
  "buy this domain",
  "this domain is for sale",
  "parked domain",
  "sedo",
  "hugedomains",
  "afternic",
  "parkingcrew",
  "default web site page",
  "account suspended",
  "domain not supported",
];

const unrelatedSpamSignals = [
  "casino",
  "sportsbook",
  "betting",
  "bong88",
  "viva88",
  "kubet",
  "hello88",
  "slot game",
  "xổ số",
];

const aiSignals = [
  " ai ",
  "artificial intelligence",
  "llm",
  "chatbot",
  "assistant",
  "automation",
  "generate",
  "generator",
  "image generation",
  "video generation",
  "voice ai",
  "text to",
  "prompt",
  "machine learning",
];

const normalizeText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const extractTag = (html, pattern) => html.match(pattern)?.[1]?.trim() || "";

const getNameTokens = (name) =>
  String(name || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);

const fetchWithTimeout = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; AI-Gyan-LinkCheck/1.0)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    const html = await response.text().catch(() => "");

    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      html,
    };
  } finally {
    clearTimeout(timeout);
  }
};

const buildResult = (verificationStatus, payload) => ({
  verificationStatus,
  lastCheckedAt: new Date(),
  lastCheckStatusCode: payload?.status ?? null,
  lastCheckFinalUrl: payload?.finalUrl || "",
});

export const runToolHealthCheck = async ({ name, websiteUrl }) => {
  let payload;

  try {
    payload = await fetchWithTimeout(websiteUrl);
  } catch (error) {
    return {
      ...buildResult("review"),
      lastCheckIssue: error.name === "AbortError" ? "fetch_error:timeout" : `fetch_error:${error.message}`,
    };
  }

  if (!payload.ok) {
    if (brokenStatusCodes.has(payload.status)) {
      return {
        ...buildResult("broken", payload),
        lastCheckIssue: `http_status:${payload.status}`,
      };
    }

    if (reviewStatusCodes.has(payload.status)) {
      return {
        ...buildResult("review", payload),
        lastCheckIssue: `http_status:${payload.status}`,
      };
    }

    return {
      ...buildResult("review", payload),
      lastCheckIssue: `http_status:${payload.status}`,
    };
  }

  const title = normalizeText(extractTag(payload.html, /<title[^>]*>([\s\S]*?)<\/title>/i));
  const description = normalizeText(
    extractTag(payload.html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      extractTag(payload.html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
  );
  const text = normalizeText(`${title} ${description} ${payload.html.slice(0, 10000).replace(/<[^>]*>/g, " ")}`);
  const finalHost = (() => {
    try {
      return new URL(payload.finalUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const nameTokens = getNameTokens(name);
  const hasNameMatch = nameTokens.some((token) => text.includes(token));
  const hasAiMatch = aiSignals.some((signal) => text.includes(signal));
  const parkedMatches = strongParkedSignals.filter((signal) => text.includes(signal));
  const hasSpamSignal = unrelatedSpamSignals.some((signal) => text.includes(signal) || finalHost.includes(signal));
  const redirectedAway = (() => {
    try {
      const originalHost = new URL(websiteUrl).hostname.replace(/^www\./, "");
      return finalHost && finalHost !== originalHost;
    } catch {
      return false;
    }
  })();

  if (parkedMatches.length && !hasAiMatch && (!hasNameMatch || text.length < 3500)) {
    return {
      ...buildResult("broken", payload),
      lastCheckIssue: "parked_or_placeholder_site",
    };
  }

  if (redirectedAway && hasSpamSignal) {
    return {
      ...buildResult("broken", payload),
      lastCheckIssue: `redirected_to_unrelated_host:${finalHost}`,
    };
  }

  if (redirectedAway && !hasNameMatch && !hasAiMatch) {
    return {
      ...buildResult("review", payload),
      lastCheckIssue: `redirected_to_different_host:${finalHost}`,
    };
  }

  return {
    ...buildResult("verified", payload),
    lastCheckIssue: "",
  };
};
