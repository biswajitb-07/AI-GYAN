import EmptyState from "../components/shared/EmptyState";
import SectionTitle from "../components/shared/SectionTitle";
import NewsCard from "../components/news/NewsCard";
import NewsCardSkeleton from "../components/news/NewsCardSkeleton";
import { useGetLatestNewsQuery } from "../store/userApi";
import SeoMeta from "../components/shared/SeoMeta";

const BlogPage = () => {
  const { data: articles = [], isLoading, isFetching } = useGetLatestNewsQuery(undefined, {
    pollingInterval: 60000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
  });
  const loading = isLoading || isFetching;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <SeoMeta
        title="Latest AI News | Ai Gyan"
        description="Read the latest AI news, product moves, and industry updates in a clean, curated format on Ai Gyan."
        canonicalPath="/blog"
      />
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.92))] p-5 shadow-[0_28px_90px_rgba(2,6,23,0.34)] sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/35 to-transparent" />
          <SectionTitle
            eyebrow="AI news"
            title="Today's latest AI news in a clean format"
            description="Each refresh cycle keeps only the latest five AI stories. With one admin click, the previous batch is replaced with a newly curated set."
          />
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : articles.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {articles.map((article) => (
              <NewsCard key={article._id || article.slug} article={article} />
            ))}
          </div>
        ) : (
          <EmptyState title="No AI news available right now" description="The admin sync action can pull the latest stories again." />
        )}
      </div>
    </section>
  );
};

export default BlogPage;
