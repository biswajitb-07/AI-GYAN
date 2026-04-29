import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertTriangle, BadgeCheck, FilePenLine, Share2, Star } from "lucide-react";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import Loader from "../components/shared/Loader";
import SeoMeta from "../components/shared/SeoMeta";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import {
  useCreateToolReviewMutation,
  useGetRelatedToolsQuery,
  useGetToolBySlugQuery,
  useReportToolMutation,
  useSubmitToolClaimMutation,
} from "../store/userApi";
import { pushRecentViewed } from "../utils/discoveryStorage";
import { toCategorySlug } from "../utils/slugify";

const verificationStyles = {
  verified: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  review: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  broken: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  unchecked: "border-white/10 bg-white/5 text-slate-300",
};

const verificationLabels = {
  verified: "Verified listing",
  review: "Under review",
  broken: "Link issue found",
  unchecked: "Not checked yet",
};

const formatLastChecked = (value) => {
  if (!value) {
    return "Last checked status is not available yet.";
  }

  return `Last checked on ${new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
};

const formatHealthIssue = (value = "") => {
  if (!value) {
    return "";
  }

  if (value.startsWith("http_status:")) {
    return `The website responded with ${value.replace("http_status:", "HTTP ")} during the last check.`;
  }

  if (value === "parked_or_placeholder_site") {
    return "The last check found a placeholder or parked page instead of a usable product website.";
  }

  if (value.startsWith("redirected_to_unrelated_host:")) {
    return "The tool website redirected to an unrelated destination during the last check.";
  }

  if (value.startsWith("redirected_to_different_host:")) {
    return "The tool website redirected to a different host and is waiting for review.";
  }

  if (value.startsWith("fetch_error:")) {
    return "The last check could not fully load the tool website and it now needs review.";
  }

  return value;
};

const ToolDetailPage = () => {
  const { slug } = useParams();
  const { data: tool, isLoading: loading, isError: error } = useGetToolBySlugQuery(slug);
  const { data: relatedTools = [] } = useGetRelatedToolsQuery(slug, { skip: !slug });
  const [createToolReview] = useCreateToolReviewMutation();
  const [reportTool] = useReportToolMutation();
  const [submitToolClaim] = useSubmitToolClaimMutation();
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [reviewState, setReviewState] = useState({ submitting: false, reviews: [] });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [requestDialog, setRequestDialog] = useState({ open: false, type: "report" });
  const [requestForm, setRequestForm] = useState({ name: "", email: "", message: "" });
  const [requestState, setRequestState] = useState({ submitting: false, message: "", error: false });

  useEffect(() => {
    if (!tool) {
      return;
    }

    pushRecentViewed(tool);
    setReviewState((current) => ({
      ...current,
      reviews: tool.reviews || [],
    }));
  }, [tool]);

  useEffect(() => {
    if (!isReviewDialogOpen && !requestDialog.open) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsReviewDialogOpen(false);
        setRequestDialog((current) => ({ ...current, open: false }));
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isReviewDialogOpen, requestDialog.open]);

  if (loading) {
    return <Loader label="Loading tool profile..." />;
  }

  if (error || !tool) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-white">Tool not found</h1>
        <p className="mt-4 text-sm text-slate-300">The AI tool you requested is missing or unavailable right now.</p>
      </div>
    );
  }
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <SeoMeta
        title={`${tool.name} Review, Pricing, Features and Alternatives | Ai Gyan`}
        description={tool.description || tool.longDescription?.slice(0, 155) || `Explore ${tool.name} on Ai Gyan with pricing, features, reviews, and related AI tools.`}
        canonicalPath={`/tools/${tool.slug}`}
        image={tool.image?.url || "/logo.png"}
        type="article"
      />
      <div className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="lg:hidden">
            <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/30">
              <img src={tool.image.url} alt={tool.name} className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/categories/${toCategorySlug(tool.category)}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white">
                  {tool.category}
                </Link>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/15 px-4 py-1.5 text-sm text-sky-100">{tool.pricing}</span>
                <span className={`rounded-full border px-4 py-1.5 text-sm ${verificationStyles[tool.verificationStatus || "unchecked"]}`}>
                  {verificationLabels[tool.verificationStatus || "unchecked"]}
                </span>
                {tool.featured ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/15 px-4 py-1.5 text-sm text-emerald-100">Featured</span>
                ) : null}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{tool.name}</h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">{tool.longDescription}</p>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <BadgeCheck size={16} className={tool.verificationStatus === "verified" ? "text-emerald-300" : "text-slate-300"} />
                  <p className="text-sm font-semibold text-white">{verificationLabels[tool.verificationStatus || "unchecked"]}</p>
                </div>
                <p className="mt-2 text-sm text-slate-300">{formatLastChecked(tool.lastCheckedAt)}</p>
                {tool.lastCheckIssue ? <p className="mt-2 text-xs text-slate-400">Health note: {formatHealthIssue(tool.lastCheckIssue)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                    } catch {
                      // ignore
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestDialog({ open: true, type: "report" });
                    setRequestState({ submitting: false, message: "", error: false });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
                >
                  <AlertTriangle size={16} />
                  Report this tool
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequestDialog({ open: true, type: "claim" });
                    setRequestState({ submitting: false, message: "", error: false });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <FilePenLine size={16} />
                  Claim or update listing
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Rating", `${tool.rating}/5`],
                ["Traffic", tool.monthlyVisits],
                ["Pricing", tool.pricing],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold text-white">Why teams use {tool.name}</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {tool.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-900/75 px-4 py-2 text-sm text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 lg:hidden">
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Visit Official Website
              </a>
              <AdsterraScriptUnit desktopUnit={adsterraConfig.detailDesktopUnit} mobileUnit={adsterraConfig.detailMobileUnit} title="Sponsored" minHeight={90} />
              <AdsterraDirectLinkCard />
            </div>

            <div className="hidden space-y-4 lg:block">
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Visit Official Website
              </a>
            </div>
          </div>

          <div className="hidden space-y-6 lg:flex lg:flex-col">
            <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/30">
              <img src={tool.image.url} alt={tool.name} className="h-full w-full object-contain" />
            </div>
            <AdsterraScriptUnit desktopUnit={adsterraConfig.detailDesktopUnit} mobileUnit={adsterraConfig.detailMobileUnit} title="Sponsored" minHeight={90} />
            <AdsterraDirectLinkCard />
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">User reviews</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">What people say about {tool.name}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-400">{reviewState.reviews.length} reviews</p>
              <button
                type="button"
                onClick={() => setIsReviewDialogOpen(true)}
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              >
                Write a Review
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {reviewState.reviews.length ? (
              reviewState.reviews.map((review, index) => (
                <div key={`${review.name}-${index}`} className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{review.name}</p>
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Star size={14} className="fill-current" />
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No reviews yet. Be the first to share feedback.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">Related tools</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Alternatives and nearby picks</h2>
            </div>
          </div>
          <ToolGrid tools={relatedTools} loading={false} />
        </div>
      </div>

      {isReviewDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setIsReviewDialogOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-[#111827] p-6 shadow-2xl shadow-slate-950/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">User reviews</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Share your review for {tool.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewDialogOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setReviewState((current) => ({ ...current, submitting: true }));

                try {
                  const response = await createToolReview({ slug: tool.slug, payload: reviewForm }).unwrap();
                  setReviewState((current) => ({
                    submitting: false,
                    reviews: [response.data, ...current.reviews],
                  }));
                  setReviewForm({ name: "", rating: 5, comment: "" });
                  setIsReviewDialogOpen(false);
                } catch {
                  setReviewState((current) => ({ ...current, submitting: false }));
                }
              }}
              className="mt-5 grid gap-4 md:grid-cols-2"
            >
              <input
                value={reviewForm.name}
                onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Your name"
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              />
              <select
                value={reviewForm.rating}
                onChange={(event) => setReviewForm((current) => ({ ...current, rating: Number(event.target.value) }))}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>
              <textarea
                value={reviewForm.comment}
                onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                placeholder="Share a quick review"
                rows={5}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none md:col-span-2"
              />
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={reviewState.submitting}
                  className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
                >
                  {reviewState.submitting ? "Posting..." : "Post Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {requestDialog.open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => setRequestDialog((current) => ({ ...current, open: false }))}
        >
          <div
            className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-[#111827] p-6 shadow-2xl shadow-slate-950/50"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200">
                  {requestDialog.type === "report" ? "Tool report" : "Listing claim"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {requestDialog.type === "report" ? `Tell us what looks wrong with ${tool.name}` : `Request updates for ${tool.name}`}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {requestDialog.type === "report"
                    ? "Report fake listings, broken links, category mistakes, or misleading descriptions."
                    : "If you own this product or need to correct details, send the changes you want us to review."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequestDialog((current) => ({ ...current, open: false }))}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setRequestState({ submitting: true, message: "", error: false });

                try {
                  const payload = {
                    ...requestForm,
                    pageUrl: window.location.href,
                  };

                  const response =
                    requestDialog.type === "report"
                      ? await reportTool({ slug: tool.slug, payload }).unwrap()
                      : await submitToolClaim({ slug: tool.slug, payload }).unwrap();

                  setRequestState({
                    submitting: false,
                    message: response?.message || "Thanks. We have received your request.",
                    error: false,
                  });
                  setRequestForm({ name: "", email: "", message: "" });
                } catch (error) {
                  setRequestState({
                    submitting: false,
                    message: error?.data?.message || "We could not submit your request right now.",
                    error: true,
                  });
                }
              }}
              className="mt-5 grid gap-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={requestForm.name}
                  onChange={(event) => setRequestForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  type="email"
                  value={requestForm.email}
                  onChange={(event) => setRequestForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Contact email"
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>
              <textarea
                value={requestForm.message}
                onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))}
                placeholder={requestDialog.type === "report" ? "Explain what is wrong with this listing" : "Share the updates or ownership details you want reviewed"}
                rows={6}
                required
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className={`text-sm ${requestState.error ? "text-rose-300" : "text-slate-400"}`}>
                  {requestState.message || "Your request will show up in the admin moderation queue."}
                </p>
                <button
                  type="submit"
                  disabled={requestState.submitting}
                  className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:opacity-60"
                >
                  {requestState.submitting ? "Sending..." : requestDialog.type === "report" ? "Submit report" : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ToolDetailPage;
