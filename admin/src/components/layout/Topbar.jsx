import { LoaderCircle, RefreshCw } from "lucide-react";
import { useDispatch } from "react-redux";
import { useLogoutAdminMutation, useSyncLatestNewsMutation } from "../../store/adminApi";
import { clearAuth, selectAdmin } from "../../store/authSlice";
import { useAppSelector } from "../../store/hooks";
import { useToast } from "../shared/ToastProvider";

const Topbar = () => {
  const dispatch = useDispatch();
  const admin = useAppSelector(selectAdmin);
  const [logoutAdmin] = useLogoutAdminMutation();
  const [syncLatestNews, { isLoading: newsSyncing }] = useSyncLatestNewsMutation();
  const toast = useToast();

  return (
    <header className="sticky top-0 z-40 flex flex-col gap-4 border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200">Ai Gyan Control Center</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Manage tools, categories, and discovery analytics</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">{admin?.email}</div>
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await syncLatestNews().unwrap();
              if (response?.changed) {
                toast.success(response?.message || `Synced ${response?.data?.length || 5} latest AI news stories`);
                return;
              }

              toast.info(response?.message || "Latest batch refreshed, but no newer stories were available yet");
            } catch (error) {
              toast.error(error?.data?.message || "Unable to sync latest AI news");
            }
          }}
          disabled={newsSyncing}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {newsSyncing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {newsSyncing ? "Syncing news..." : "Sync AI News"}
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              await logoutAdmin().unwrap();
            } finally {
              dispatch(clearAuth());
              toast.info("Logged out successfully");
            }
          }}
          className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
