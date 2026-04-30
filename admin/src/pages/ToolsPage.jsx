import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DeleteToolDialog from "../components/dashboard/DeleteToolDialog";
import EditToolDialog from "../components/dashboard/EditToolDialog";
import ToolForm from "../components/dashboard/ToolForm";
import ToolsTable from "../components/dashboard/ToolsTable";
import Dialog from "../components/shared/Dialog";
import Pagination from "../components/shared/Pagination";
import Spinner from "../components/shared/Spinner";
import { useCheckToolLinkMutation, useDeleteToolMutation, useDeleteToolsBulkMutation, useGetAdminCategoriesQuery, useGetToolsQuery } from "../store/adminApi";
import { useToast } from "../components/shared/ToastProvider";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [selectedToolIds, setSelectedToolIds] = useState([]);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [checkingToolId, setCheckingToolId] = useState("");
  const [deleteTool, { isLoading: deleting }] = useDeleteToolMutation();
  const [deleteToolsBulk, { isLoading: bulkDeleting }] = useDeleteToolsBulkMutation();
  const [checkToolLink] = useCheckToolLinkMutation();
  const toast = useToast();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const pricing = searchParams.get("pricing") || "";
  const sort = searchParams.get("sort") || "";
  const featured = searchParams.get("featured") || "";
  const verificationStatus = searchParams.get("verificationStatus") || "";
  const page = sanitizePage(searchParams.get("page"));

  const toolsParams = {
    search,
    category,
    pricing,
    sort,
    featured,
    verificationStatus,
    page,
    limit: 20,
  };

  const { data: toolsResponse, isLoading: toolsLoading } = useGetToolsQuery(toolsParams);
  const { data: categoriesResponse } = useGetAdminCategoriesQuery({ limit: 200 });

  const tools = toolsResponse?.data || [];
  const pagination = toolsResponse?.pagination || null;
  const categories = categoriesResponse?.data || [];

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
    setLoading(toolsLoading);
  }, [toolsLoading]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {selectedToolIds.length > 0 ? (
          <button
            type="button"
            onClick={() => setBulkDeleteDialogOpen(true)}
            disabled={bulkDeleting}
            className="mr-3 rounded-full border border-rose-400/20 bg-rose-400/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedToolIds.length})`}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setAddToolOpen(true)}
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Add Tool
        </button>
      </div>
      <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => updateQueryParams({ search: event.target.value, page: 1 })}
            placeholder="Search tools..."
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          />
          <select
            value={category}
            onChange={(event) => updateQueryParams({ category: event.target.value, page: 1 })}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={pricing}
            onChange={(event) => updateQueryParams({ pricing: event.target.value, page: 1 })}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All pricing</option>
            {["Free", "Free Trial", "Paid"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(event) => updateQueryParams({ sort: event.target.value, page: 1 })}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">Default sort</option>
            <option value="popular">Most viewed</option>
            <option value="rating">Top rated</option>
            <option value="az">A-Z</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <select
            value={featured}
            onChange={(event) => updateQueryParams({ featured: event.target.value, page: 1 })}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All visibility</option>
            <option value="true">Featured only</option>
          </select>
          <select
            value={verificationStatus}
            onChange={(event) => updateQueryParams({ verificationStatus: event.target.value, page: 1 })}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All health states</option>
            <option value="verified">Verified</option>
            <option value="review">Needs review</option>
            <option value="broken">Broken</option>
            <option value="unchecked">Unchecked</option>
          </select>
          <button
            type="button"
            onClick={() => setSearchParams(new URLSearchParams())}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Reset filters
          </button>
        </div>
      </div>
      <ToolsTable
        tools={tools}
        totalTools={pagination?.total || tools.length}
        loading={loading}
        skeletonRowCount={toolsParams.limit}
        selectedIds={selectedToolIds}
        onToggleSelectAll={() => {
          const currentIds = tools.map((tool) => tool._id);
          const hasUnselected = currentIds.some((id) => !selectedToolIds.includes(id));

          if (hasUnselected) {
            const merged = Array.from(new Set([...selectedToolIds, ...currentIds]));
            setSelectedToolIds(merged);
            return;
          }

          setSelectedToolIds(selectedToolIds.filter((id) => !currentIds.includes(id)));
        }}
        onToggleSelect={(toolId) => {
          setSelectedToolIds((previous) => (previous.includes(toolId) ? previous.filter((id) => id !== toolId) : [...previous, toolId]));
        }}
        checkingToolId={checkingToolId}
        onCheckLink={async (tool) => {
          setCheckingToolId(tool._id);

          try {
            const response = await checkToolLink(tool._id).unwrap();
            const nextState = response?.data?.verificationStatus || "verified";
            toast.success(`Link check complete: ${tool.name} is now marked ${nextState}`);
          } catch (error) {
            toast.error(error?.data?.message || "Unable to check this tool right now");
          } finally {
            setCheckingToolId("");
          }
        }}
        onEdit={(tool) => setSelectedTool(tool)}
        onDelete={(tool) => setToolToDelete(tool)}
      />
      <Pagination pagination={pagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />

      <Dialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        title="Delete selected tools"
        description={`You are about to delete ${selectedToolIds.length} selected tools. This also removes linked Cloudinary images.`}
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-300">This action cannot be undone.</p>
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
                  const response = await deleteToolsBulk(selectedToolIds).unwrap();
                  setSelectedToolIds([]);
                  setBulkDeleteDialogOpen(false);
                  toast.success(response?.deletedCount ? `${response.deletedCount} tools deleted successfully` : "Selected tools deleted successfully");
                } catch (error) {
                  toast.error(error?.data?.message || "Unable to delete selected tools");
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
        open={addToolOpen}
        onClose={() => setAddToolOpen(false)}
        title="Add new tool"
        description="Create a new directory listing through a focused modal instead of the inline form."
      >
        <ToolForm
          categories={categories}
          onCreated={() => {
            setAddToolOpen(false);
          }}
        />
      </Dialog>
      <EditToolDialog open={Boolean(selectedTool)} tool={selectedTool} categories={categories} onClose={() => setSelectedTool(null)} onUpdated={() => setSelectedTool(null)} />
      <DeleteToolDialog
        open={Boolean(toolToDelete)}
        tool={toolToDelete}
        deleting={deleting}
        onClose={() => setToolToDelete(null)}
        onConfirm={async () => {
          if (!toolToDelete) {
            return;
          }

          try {
            await deleteTool(toolToDelete._id).unwrap();
            setSelectedToolIds((previous) => previous.filter((id) => id !== toolToDelete._id));
            setToolToDelete(null);
            toast.success("Tool deleted successfully");
          } catch (error) {
            toast.error(error?.data?.message || "Unable to delete tool");
          }
        }}
      />
    </div>
  );
};

export default ToolsPage;
