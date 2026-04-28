import { LayoutDashboard, Shapes, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tools", icon: Sparkles },
  { to: "/categories", label: "Categories", icon: Shapes },
];

const Sidebar = () => {
  return (
    <aside className="w-full max-w-xs border-r border-white/10 bg-slate-950/80 p-5 xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
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
  );
};

export default Sidebar;
