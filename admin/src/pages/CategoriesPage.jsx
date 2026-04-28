import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoriesTable from "../components/dashboard/CategoriesTable";
import CategoryForm from "../components/dashboard/CategoryForm";
import DeleteCategoryDialog from "../components/dashboard/DeleteCategoryDialog";
import EditCategoryDialog from "../components/dashboard/EditCategoryDialog";
import Dialog from "../components/shared/Dialog";
import Pagination from "../components/shared/Pagination";
import { useDeleteCategoryMutation, useGetAdminCategoriesQuery } from "../store/adminApi";
import { useToast } from "../components/shared/ToastProvider";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const CategoriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const toast = useToast();

  const search = searchParams.get("search") || "";
  const page = sanitizePage(searchParams.get("page"));
  const { data: categoriesResponse, isLoading: categoriesLoading, isFetching: categoriesFetching } = useGetAdminCategoriesQuery({
    search,
    page,
    limit: 20,
  });
  const categories = categoriesResponse?.data || [];
  const pagination = categoriesResponse?.pagination || null;

  const updateQueryParams = (nextValues) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      const normalizedValue = typeof value === "string" ? value.trim() : value;

      if (!normalizedValue || normalizedValue === 1) {
        nextSearchParams.delete(key);
        return;
      }

      nextSearchParams.set(key, String(normalizedValue));
    });

    setSearchParams(nextSearchParams);
  };

  useEffect(() => {
    setLoading(categoriesLoading || categoriesFetching);
  }, [categoriesFetching, categoriesLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={search}
          onChange={(event) => updateQueryParams({ search: event.target.value, page: 1 })}
          placeholder="Search categories..."
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none lg:max-w-md"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSearchParams(new URLSearchParams())}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setAddCategoryOpen(true)}
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Add Category
          </button>
        </div>
      </div>
      <CategoriesTable
        categories={categories}
        totalCategories={pagination?.total || categories.length}
        loading={loading}
        onEdit={(category) => setSelectedCategory(category)}
        onDelete={(category) => setCategoryToDelete(category)}
      />
      <Pagination pagination={pagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />

      <Dialog
        open={addCategoryOpen}
        onClose={() => setAddCategoryOpen(false)}
        title="Add category"
        description="Create a new category through a focused modal flow."
      >
        <CategoryForm
          onCompleted={() => {
            setAddCategoryOpen(false);
          }}
        />
      </Dialog>

      <EditCategoryDialog open={Boolean(selectedCategory)} category={selectedCategory} onClose={() => setSelectedCategory(null)} onUpdated={() => setSelectedCategory(null)} />
      <DeleteCategoryDialog
        open={Boolean(categoryToDelete)}
        category={categoryToDelete}
        deleting={deleting}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={async () => {
          if (!categoryToDelete) {
            return;
          }

          try {
            await deleteCategory(categoryToDelete._id).unwrap();
            setCategoryToDelete(null);
            toast.success("Category deleted successfully");
          } catch (error) {
            toast.error(error?.data?.message || "Unable to delete category");
          }
        }}
      />
    </div>
  );
};

export default CategoriesPage;
