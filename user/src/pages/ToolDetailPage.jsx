import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GitCompare, Heart, Share2, Star } from "lucide-react";
import { createToolReview, fetchRelatedTools, fetchToolBySlug } from "../api/tools";
import AdsterraDirectLinkCard from "../components/ads/AdsterraDirectLinkCard";
import AdsterraScriptUnit from "../components/ads/AdsterraScriptUnit";
import Loader from "../components/shared/Loader";
import ToolGrid from "../components/tools/ToolGrid";
import { adsterraConfig } from "../config/adsterra";
import { useAsyncData } from "../hooks/useAsyncData";
import { getCompareSlugs, getFavorites, pushRecentViewed, toggleCompareSlug, toggleFavorite } from "../utils/discoveryStorage";
import { toCategorySlug } from "../utils/slugify";

const ToolDetailPage = () => {
  const { slug } = useParams();
  const { data: tool, loading, error } = useAsyncData(() => fetchToolBySlug(slug), [slug]);
  const [relatedTools, setRelatedTools] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [compareSlugs, setCompareSlugs] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [reviewState, setReviewState] = useState({ submitting: false, reviews: [] });
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites().map((item) => item.slug));
    setCompareSlugs(getCompareSlugs());
  }, []);

  useEffect(() => {
    if (!tool) {
      return;
    }

    pushRecentViewed(tool);
    setReviewState((current) => ({
      ...current,
      reviews: tool.reviews || [],
    }));

    const loadRelated = async () => {
      try {
        const nextTools = await fetchRelatedTools(tool.slug);
        setRelatedTools(nextTools);
      } catch {
        setRelatedTools([]);
      }
    };

    loadRelated();
  }, [tool]);

  useEffect(() => {
    if (!isReviewDialogOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsReviewDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isReviewDialogOpen]);

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

  const isFavorite = favorites.includes(tool.slug);
  const isCompared = compareSlugs.includes(tool.slug);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/categories/${toCategorySlug(tool.category)}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white">
                  {tool.category}
                </Link>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/15 px-4 py-1.5 text-sm text-sky-100">{tool.pricing}</span>
                {tool.featured ? (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/15 px-4 py-1.5 text-sm text-emerald-100">Featured</span>
                ) : null}
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{tool.name}</h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300">{tool.longDescription}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setFavorites(toggleFavorite(tool).map((item) => item.slug))}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${isFavorite ? "bg-rose-400/15 text-rose-200" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
                >
                  <Heart size={16} />
                  {isFavorite ? "Saved" : "Save tool"}
                </button>
                <button
                  type="button"
                  onClick={() => setCompareSlugs(toggleCompareSlug(tool.slug))}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${isCompared ? "bg-sky-400/15 text-sky-100" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}`}
                >
                  <GitCompare size={16} />
                  {isCompared ? "Added to compare" : "Add to compare"}
                </button>
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
          </div>

          <div className="space-y-6">
            <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/30">
              <img src={tool.image.url} alt={tool.name} className="h-full w-full object-contain" />
            </div>
            <AdsterraScriptUnit scriptSrc={adsterraConfig.detailScriptSrc} title="Sponsored" minHeight={90} />
            <AdsterraDirectLinkCard />
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-sky-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Visit Official Website
            </a>
            <Link
              to={`/compare?slugs=${[...new Set([...compareSlugs, tool.slug])].join(",")}`}
              className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open Compare View
            </Link>
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
                  const response = await createToolReview(tool.slug, reviewForm);
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
    </section>
  );
};

export default ToolDetailPage;
