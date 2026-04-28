import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { deleteTool, fetchCategories, fetchTools } from "../api/dashboard";
import DeleteToolDialog from "../components/dashboard/DeleteToolDialog";
import EditToolDialog from "../components/dashboard/EditToolDialog";
import ToolForm from "../components/dashboard/ToolForm";
import ToolsTable from "../components/dashboard/ToolsTable";
import Dialog from "../components/shared/Dialog";
import Pagination from "../components/shared/Pagination";
import { useToast } from "../components/shared/ToastProvider";

const sanitizePage = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const ToolsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [addToolOpen, setAddToolOpen] = useState(false);
  const toast = useToast();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const pricing = searchParams.get("pricing") || "";
  const sort = searchParams.get("sort") || "";
  const featured = searchParams.get("featured") || "";
  const page = sanitizePage(searchParams.get("page"));

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

  const loadData = async () => {
    const [toolResponse, categoryResponse] = await Promise.all([
      fetchTools({
        search,
        category,
        pricing,
        sort,
        featured,
        page,
        limit: 20,
      }),
      fetchCategories({ limit: 200 }),
    ]);

    setTools(toolResponse.data);
    setPagination(toolResponse.pagination);
    setCategories(categoryResponse.data || []);
  };

  useEffect(() => {
    loadData();
  }, [search, category, pricing, sort, featured, page]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
        onEdit={(tool) => setSelectedTool(tool)}
        onDelete={(tool) => setToolToDelete(tool)}
      />
      <Pagination pagination={pagination} onPageChange={(nextPage) => updateQueryParams({ page: nextPage })} />

      <Dialog
        open={addToolOpen}
        onClose={() => setAddToolOpen(false)}
        title="Add new tool"
        description="Create a new directory listing through a focused modal instead of the inline form."
      >
        <ToolForm
          categories={categories}
          onCreated={() => {
            loadData();
            setAddToolOpen(false);
          }}
        />
      </Dialog>
      <EditToolDialog open={Boolean(selectedTool)} tool={selectedTool} categories={categories} onClose={() => setSelectedTool(null)} onUpdated={loadData} />
      <DeleteToolDialog
        open={Boolean(toolToDelete)}
        tool={toolToDelete}
        deleting={deleting}
        onClose={() => setToolToDelete(null)}
        onConfirm={async () => {
          if (!toolToDelete) {
            return;
          }

          setDeleting(true);
          try {
            await deleteTool(toolToDelete._id);
            setToolToDelete(null);
            await loadData();
            toast.success("Tool deleted successfully");
          } catch (error) {
            toast.error(error.response?.data?.message || "Unable to delete tool");
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
};

export default ToolsPage;
