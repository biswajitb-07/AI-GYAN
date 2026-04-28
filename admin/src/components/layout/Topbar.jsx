import { useAuth } from "../../context/AuthContext";
import { useToast } from "../shared/ToastProvider";

const Topbar = () => {
  const { admin, logout } = useAuth();
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
            await logout();
            toast.info("Logged out successfully");
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
