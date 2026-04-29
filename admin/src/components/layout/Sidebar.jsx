import { LayoutDashboard, MessageSquareWarning, Shapes, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tools", icon: Sparkles },
  { to: "/categories", label: "Categories", icon: Shapes },
  { to: "/moderation", label: "Moderation", icon: MessageSquareWarning },
];

const Sidebar = ({ sidebarOpen = false, onClose }) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition xl:hidden ${
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] border-r border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-slate-950/40 transition-transform duration-300 xl:static xl:z-auto xl:w-full xl:max-w-xs xl:translate-x-0 xl:bg-slate-950/80 xl:shadow-none xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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
      </aside>
    </>
  );
};

export default Sidebar;
