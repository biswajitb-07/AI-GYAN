import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CategoriesTable from "../components/dashboard/CategoriesTable";
import CategoryForm from "../components/dashboard/CategoryForm";
import DeleteCategoryDialog from "../components/dashboard/DeleteCategoryDialog";
import EditCategoryDialog from "../components/dashboard/EditCategoryDialog";
import Dialog from "../components/shared/Dialog";
import Pagination from "../components/shared/Pagination";
import Spinner from "../components/shared/Spinner";
import { useDeleteCategoriesBulkMutation, useDeleteCategoryMutation, useGetAdminCategoriesQuery } from "../store/adminApi";
import { useToast } from "../components/shared/ToastProvider";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const CategoriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();
  const [deleteCategoriesBulk, { isLoading: bulkDeleting }] = useDeleteCategoriesBulkMutation();
  const toast = useToast();

  const search = searchParams.get("search") || "";
  const page = sanitizePage(searchParams.get("page"));
  const { data: categoriesResponse, isLoading: categoriesLoading } = useGetAdminCategoriesQuery({
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
    setLoading(categoriesLoading);
  }, [categoriesLoading]);

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
          {selectedCategoryIds.length > 0 ? (
            <button
              type="button"
              onClick={() => setBulkDeleteDialogOpen(true)}
              disabled={bulkDeleting}
              className="rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedCategoryIds.length})`}
            </button>
          ) : null}
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
        skeletonRowCount={20}
        selectedIds={selectedCategoryIds}
        onToggleSelectAll={() => {
          const currentIds = categories.map((category) => category._id);
          const hasUnselected = currentIds.some((id) => !selectedCategoryIds.includes(id));

          if (hasUnselected) {
            const merged = Array.from(new Set([...selectedCategoryIds, ...currentIds]));
            setSelectedCategoryIds(merged);
            return;
          }

          setSelectedCategoryIds(selectedCategoryIds.filter((id) => !currentIds.includes(id)));
        }}
        onToggleSelect={(categoryId) => {
          setSelectedCategoryIds((previous) => (previous.includes(categoryId) ? previous.filter((id) => id !== categoryId) : [...previous, categoryId]));
        }}
        onEdit={(category) => setSelectedCategory(category)}
        onDelete={(category) => setCategoryToDelete(category)}
      />
      <Pagination pagination={pagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />

      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        title="Delete selected categories"
        description={`You are about to delete ${selectedCategoryIds.length} selected categories.`}
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-300">This action cannot be undone. Tools using these category names will not be deleted automatically.</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await deleteCategoriesBulk(selectedCategoryIds).unwrap();
                  setSelectedCategoryIds([]);
                  setBulkDeleteDialogOpen(false);
                  toast.success(response?.deletedCount ? `${response.deletedCount} categories deleted successfully` : "Selected categories deleted successfully");
                } catch (error) {
                  toast.error(error?.data?.message || "Unable to delete selected categories");
                }
              }}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
            >
              {bulkDeleting ? (
                <>
                  <Spinner size="sm" />
                  Deleting...
                </>
              ) : (
                "Delete Selected"
              )}
            </button>
          </div>
        </div>
      </Dialog>

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
            setSelectedCategoryIds((previous) => previous.filter((id) => id !== categoryToDelete._id));
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
