import { useParams, useSearchParams } from "react-router-dom";
import SectionTitle from "../components/shared/SectionTitle";
import Pagination from "../components/tools/Pagination";
import ToolGrid from "../components/tools/ToolGrid";
import { useGetCategoryBySlugQuery } from "../store/userApi";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = sanitizePage(searchParams.get("page"));
  const { data, isLoading } = useGetCategoryBySlugQuery({
    slug,
    params: { page, limit: 24 },
  });
  const category = data?.category || null;
  const tools = data?.tools || [];
  const pagination = data?.pagination || null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        <SectionTitle
          eyebrow="Category focus"
          title={category ? category.name : "Category not found"}
          description={category?.description || "Browse the curated tools inside this category."}
        />
        <ToolGrid tools={tools} loading={isLoading} />
        <Pagination
          pagination={pagination}
          onPageChange={(nextPage) => {
            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.set("page", String(nextPage));
            setSearchParams(nextSearchParams);
          }}
        />
      </div>
    </section>
  );
};

export default CategoryDetailPage;
