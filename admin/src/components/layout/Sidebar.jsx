import { LayoutDashboard, LoaderCircle, MessageSquareWarning, RefreshCw, Shapes, Sparkles, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLogoutAdminMutation, useSyncLatestNewsMutation } from "../../store/adminApi";
import { clearAuth, selectAdmin } from "../../store/authSlice";
import { useAppSelector } from "../../store/hooks";
import { useToast } from "../shared/ToastProvider";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tools", icon: Sparkles },
  { to: "/categories", label: "Categories", icon: Shapes },
  { to: "/moderation", label: "Moderation", icon: MessageSquareWarning },
];

const Sidebar = ({ sidebarOpen = false, onClose }) => {
  const dispatch = useDispatch();
  const admin = useAppSelector(selectAdmin);
  const [logoutAdmin] = useLogoutAdminMutation();
  const [syncLatestNews, { isLoading: newsSyncing }] = useSyncLatestNewsMutation();
  const toast = useToast();

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm transition xl:hidden ${
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[min(86vw,320px)] border-r border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/40 transition-transform duration-300 xl:static xl:z-auto xl:w-full xl:max-w-xs xl:translate-x-0 xl:bg-slate-950/80 xl:shadow-none xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex justify-end xl:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <img src="/logo.png" alt="Ai Gyan" className="h-12 w-12 rounded-2xl object-cover" />
          <div>
            <p className="text-lg font-semibold text-white">Ai Gyan</p>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Admin</p>
          </div>
        </div>
        <nav className="mt-8 space-y-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-white/8 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 space-y-3 border-t border-white/10 pt-4 xl:hidden">
          <div className="truncate rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200">{admin?.email}</div>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
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
            className="w-full rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/20"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
