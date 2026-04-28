import { ArrowUpRight, CalendarDays, Newspaper } from "lucide-react";

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const NewsCard = ({ article }) => {
  return (
    <article className="group overflow-hidden rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.96))] shadow-[0_22px_65px_rgba(2,6,23,0.28)] sm:rounded-[1.75rem]">
      <div className="flex gap-4 p-3 sm:block sm:p-0">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.1rem] border border-white/10 bg-slate-900 sm:h-auto sm:w-full sm:rounded-none sm:border-x-0 sm:border-t-0">
          <img
            src={article.image.url}
            alt={article.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-3 sm:space-y-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200 sm:gap-3 sm:text-xs sm:tracking-[0.22em]">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 sm:px-3">
              <Newspaper size={13} />
              <span className="truncate">{article.sourceName}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-slate-400">
              <CalendarDays size={13} />
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            <h2 className="line-clamp-3 text-lg font-semibold leading-snug text-white sm:text-2xl sm:leading-tight">{article.title}</h2>
            <p className="line-clamp-3 text-sm leading-6 text-slate-300 sm:line-clamp-none sm:leading-7">{article.summary}</p>
          </div>

          <a
            href={article.articleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-sky-400/30 hover:bg-white/10 sm:px-5 sm:py-3"
          >
            Read full story
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;
