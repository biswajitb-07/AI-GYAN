import { useState } from "react";
import { ExternalLink, LoaderCircle, RefreshCw } from "lucide-react";
import Loader from "../components/shared/Loader";
import {
  useCheckToolLinkMutation,
  useGetAdminFeedbackQuery,
  useGetModerationStatsQuery,
  useGetToolsQuery,
  useRunBulkLinkScanMutation,
  useUpdateFeedbackStatusMutation,
} from "../store/adminApi";
import { useToast } from "../components/shared/ToastProvider";

const toneMap = {
  verified: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  review: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  broken: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  unchecked: "border-white/10 bg-white/5 text-slate-300",
  open: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  resolved: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
};

const labelMap = {
  "tool-report": "Tool report",
  "tool-claim": "Claim / update",
  "site-improvement": "Site improvement",
  "feature-request": "Feature request",
  "bug-report": "Bug report",
  "tool-quality": "Tool quality",
  Suggestion: "Suggestion",
};

const StatCard = ({ label, value, tone = "text-white" }) => (
  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
    <p className={`mt-3 text-3xl font-semibold ${tone}`}>{value}</p>
  </div>
);

const ModerationPage = () => {
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("open");
  const [checkingToolId, setCheckingToolId] = useState("");
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState("");
  const toast = useToast();

  const { data: stats, isLoading: statsLoading } = useGetModerationStatsQuery();
  const { data: feedbackResponse, isLoading: feedbackLoading } = useGetAdminFeedbackQuery({
    page: feedbackPage,
    limit: 12,
    type: feedbackType,
    status: feedbackStatus,
  });
  const { data: flaggedToolsResponse, isLoading: flaggedToolsLoading } = useGetToolsQuery({
    verificationStatus: "broken,review,unchecked",
    sort: "newest",
    page: 1,
    limit: 16,
  });
  const [updateFeedbackStatus] = useUpdateFeedbackStatusMutation();
  const [checkToolLink] = useCheckToolLinkMutation();
  const [runBulkLinkScan, { isLoading: scanningAll }] = useRunBulkLinkScanMutation();

  if (statsLoading && !stats) {
    return <Loader />;
  }

  const overview = stats?.overview || {};
  const recentlyChecked = stats?.recentlyChecked || [];
  const feedbackItems = feedbackResponse?.data || [];
  const feedbackPagination = feedbackResponse?.pagination;
  const flaggedTools = flaggedToolsResponse?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Moderation</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Feedback, reports, claims, and link health</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Review what users send in, keep tool links healthy, and surface which listings still need verification work.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await runBulkLinkScan().unwrap();
              toast.success(response?.message || "Link scan finished");
            } catch (error) {
              toast.error(error?.data?.message || "Unable to run the link scan right now");
            }
          }}
          disabled={scanningAll}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {scanningAll ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {scanningAll ? "Scanning all tools..." : "Run broken link scan"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open feedback" value={overview.openFeedback || 0} tone="text-cyan-100" />
        <StatCard label="Tool reports" value={overview.toolReports || 0} tone="text-rose-100" />
        <StatCard label="Claim requests" value={overview.toolClaims || 0} tone="text-amber-100" />
        <StatCard label="Broken links" value={overview.brokenLinks || 0} tone="text-rose-100" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Feedback queue</h3>
              <p className="mt-1 text-sm text-slate-300">Everything users submit from contact, tool reports, and claim requests.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={feedbackType}
                onChange={(event) => {
                  setFeedbackType(event.target.value);
                  setFeedbackPage(1);
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">All types</option>
                <option value="tool-report">Tool reports</option>
                <option value="tool-claim">Claim / update requests</option>
                <option value="site-improvement">Site improvement</option>
                <option value="feature-request">Feature request</option>
                <option value="bug-report">Bug report</option>
                <option value="tool-quality">Tool quality</option>
                <option value="Suggestion">Suggestion</option>
              </select>
              <select
                value={feedbackStatus}
                onChange={(event) => {
                  setFeedbackStatus(event.target.value);
                  setFeedbackPage(1);
                }}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {feedbackLoading ? (
              <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">Loading feedback...</div>
            ) : feedbackItems.length ? (
              feedbackItems.map((item) => (
                <div key={item._id} className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[item.status]}`}>{item.status}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                          {labelMap[item.type] || item.type}
                        </span>
                        {item.toolName ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">{item.toolName}</span>
                        ) : null}
                      </div>
                      <p className="text-sm font-semibold text-white">{item.name || "Anonymous"}</p>
                      {item.email ? <p className="text-xs text-slate-400">{item.email}</p> : null}
                      <p className="text-sm leading-7 text-slate-300">{item.message}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>{new Date(item.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        {item.pageUrl ? (
                          <a href={item.pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-200 hover:text-cyan-100">
                            Page
                            <ExternalLink size={12} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={updatingFeedbackId === item._id}
                      onClick={async () => {
                        setUpdatingFeedbackId(item._id);
                        const nextStatus = item.status === "resolved" ? "open" : "resolved";

                        try {
                          await updateFeedbackStatus({ id: item._id, status: nextStatus }).unwrap();
                          toast.success(`Feedback marked ${nextStatus}`);
                        } catch (error) {
                          toast.error(error?.data?.message || "Unable to update feedback status");
                        } finally {
                          setUpdatingFeedbackId("");
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                    >
                      {updatingFeedbackId === item._id ? "Updating..." : item.status === "resolved" ? "Reopen" : "Resolve"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">No feedback matches this filter.</div>
            )}
          </div>

          {feedbackPagination?.pages > 1 ? (
            <div className="mt-4 flex flex-col gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Feedback pages</p>
                <p className="mt-1 text-sm text-slate-300">
                  Page {feedbackPagination.page} of {feedbackPagination.pages} with {feedbackPagination.total} total entries
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackPage((current) => Math.max(current - 1, 1))}
                  disabled={feedbackPagination.page === 1}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackPage((current) => Math.min(current + 1, feedbackPagination.pages))}
                  disabled={feedbackPagination.page === feedbackPagination.pages}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <div className="space-y-6">
          <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">Flagged tool health</h3>
                <p className="mt-1 text-sm text-slate-300">Broken, review, and unchecked listings that still need attention.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-sm text-slate-200">{flaggedTools.length} shown</span>
            </div>

            <div className="mt-5 space-y-3">
              {flaggedToolsLoading ? (
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">Loading tool health...</div>
              ) : flaggedTools.length ? (
                flaggedTools.map((tool) => (
                  <div key={tool._id} className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{tool.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{tool.category}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tool.verificationStatus || "unchecked"]}`}>
                            {tool.verificationStatus || "unchecked"}
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                            {tool.lastCheckedAt
                              ? new Date(tool.lastCheckedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "Never checked"}
                          </span>
                        </div>
                        {tool.lastCheckIssue ? <p className="mt-3 text-xs leading-6 text-slate-400">{tool.lastCheckIssue}</p> : null}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={checkingToolId === tool._id}
                          onClick={async () => {
                            setCheckingToolId(tool._id);

                            try {
                              await checkToolLink(tool._id).unwrap();
                              toast.success(`Checked ${tool.name}`);
                            } catch (error) {
                              toast.error(error?.data?.message || "Unable to check this tool");
                            } finally {
                              setCheckingToolId("");
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                        >
                          {checkingToolId === tool._id ? "Checking..." : "Check again"}
                        </button>
                        <a
                          href={tool.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                          Open
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-slate-950/60 p-5 text-sm text-slate-400">No flagged tools right now.</div>
              )}
            </div>
          </section>

          <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Recently checked</h3>
            <div className="mt-4 space-y-3">
              {recentlyChecked.length ? (
                recentlyChecked.map((tool) => (
                  <div key={tool.slug} className="rounded-[1.2rem] border border-white/10 bg-slate-950/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{tool.name}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {tool.lastCheckedAt ? new Date(tool.lastCheckedAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never"}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tool.verificationStatus || "unchecked"]}`}>
                        {tool.verificationStatus || "unchecked"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-slate-950/60 px-4 py-5 text-sm text-slate-400">
                  No tools have been checked yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModerationPage;
