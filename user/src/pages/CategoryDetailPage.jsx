import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { fetchCategoryBySlug } from "../api/tools";
import SectionTitle from "../components/shared/SectionTitle";
import Pagination from "../components/tools/Pagination";
import ToolGrid from "../components/tools/ToolGrid";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const CategoryDetailPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = sanitizePage(searchParams.get("page"));
  const [state, setState] = useState({
    category: null,
    tools: [],
    pagination: null,
    loading: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setState((current) => ({ ...current, loading: true }));

      try {
        const response = await fetchCategoryBySlug(slug, { page, limit: 24 });
        setState({
          category: response.category,
          tools: response.tools,
          pagination: response.pagination,
          loading: false,
        });
      } catch {
        setState({
          category: null,
          tools: [],
          pagination: null,
          loading: false,
        });
      }
    };

    loadData();
  }, [page, slug]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="space-y-6 sm:space-y-8">
        <SectionTitle
          eyebrow="Category focus"
          title={state.category ? state.category.name : "Category not found"}
          description={state.category?.description || "Browse the curated tools inside this category."}
        />
        <ToolGrid tools={state.tools} loading={state.loading} />
        <Pagination
          pagination={state.pagination}
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
