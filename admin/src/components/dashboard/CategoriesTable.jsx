import { Pencil, Trash2 } from "lucide-react";

const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

const CategoriesTable = ({ categories = [], totalCategories = 0, loading = false, onEdit, onDelete }) => {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All categories</h3>
          <p className="mt-1 text-sm text-slate-300">Paginated category inventory for the directory structure.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-200">{totalCategories} categories</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Tools</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((row) => (
                  <tr key={`category-skeleton-${row}`} className="border-t border-white/10">
                    <td className="py-3">
                      <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="max-w-xl space-y-2">
                        <div className="h-4 w-full animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/10" />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-10 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <div className="h-10 w-24 animate-pulse rounded-full bg-cyan-400/10" />
                        <div className="h-10 w-28 animate-pulse rounded-full bg-rose-400/10" />
                      </div>
                    </td>
                  </tr>
                ))
              : categories.map((category) => (
                  <tr key={category._id} className="border-t border-white/10 text-slate-200">
                    <td className="py-3 font-semibold">{category.name}</td>
                    <td className="py-3">
                      <p className="max-w-xl text-sm leading-7 text-slate-300">{category.description}</p>
                    </td>
                    <td className="py-3">{category.toolCount}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(category)}
                          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(category)}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesTable;
