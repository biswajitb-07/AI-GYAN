import { ExternalLink, RefreshCw, Pencil, Trash2 } from "lucide-react";

const skeletonRows = Array.from({ length: 6 }, (_, index) => index);

const healthToneMap = {
  verified: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  review: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  broken: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  unchecked: "border-white/10 bg-white/5 text-slate-300",
};

const healthLabelMap = {
  verified: "Verified",
  review: "Review",
  broken: "Broken",
  unchecked: "Unchecked",
};

const ToolsTable = ({ tools = [], totalTools = 0, loading = false, checkingToolId = "", onCheckLink, onDelete, onEdit }) => {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">All tools</h3>
          <p className="mt-1 text-sm text-slate-300">Directory inventory with category and pricing context.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-200">{totalTools} tools</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Tool</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Pricing</th>
              <th className="pb-3 font-medium">Health</th>
              <th className="pb-3 font-medium">Last checked</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? skeletonRows.map((row) => (
                  <tr key={`tool-skeleton-${row}`} className="border-t border-white/10">
                    <td className="py-3">
                      <div className="flex animate-pulse items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10" />
                        <div className="space-y-2">
                          <div className="h-4 w-28 rounded-full bg-white/10" />
                          <div className="h-3 w-16 rounded-full bg-white/10" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-14 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <div className="h-10 w-24 animate-pulse rounded-full bg-white/10" />
                        <div className="h-10 w-20 animate-pulse rounded-full bg-white/10" />
                        <div className="h-10 w-24 animate-pulse rounded-full bg-cyan-400/10" />
                        <div className="h-10 w-28 animate-pulse rounded-full bg-rose-400/10" />
                      </div>
                    </td>
                  </tr>
                ))
              : tools.map((tool) => (
                  <tr key={tool._id} className="border-t border-white/10 text-slate-200">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/80 p-1">
                          <img src={tool.image.url} alt={tool.name} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <p>{tool.name}</p>
                          <p className="text-xs text-slate-400">{tool.monthlyVisits}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{tool.category}</td>
                    <td className="py-3">{tool.pricing}</td>
                    <td className="py-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthToneMap[tool.verificationStatus || "unchecked"]}`}>
                        {healthLabelMap[tool.verificationStatus || "unchecked"]}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {tool.lastCheckedAt
                        ? new Date(tool.lastCheckedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Never"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onCheckLink(tool)}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          <RefreshCw size={14} className={checkingToolId === tool._id ? "animate-spin" : ""} />
                          {checkingToolId === tool._id ? "Checking..." : "Check link"}
                        </button>
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                          <ExternalLink size={14} />
                          Open
                        </a>
                        <button
                          type="button"
                          onClick={() => onEdit(tool)}
                          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(tool)}
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

export default ToolsTable;
