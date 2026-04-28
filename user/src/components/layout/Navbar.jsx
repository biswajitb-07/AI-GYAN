import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/pricing", label: "Pricing" },
];

const Navbar = () => {
  const location = useLocation();
  const shellRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div ref={shellRef} className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="Ai Gyan" className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-lg shadow-sky-500/20 sm:h-12 sm:w-12" />
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold text-white sm:text-lg">Ai Gyan</p>
              <p className="text-[10px] uppercase tracking-[0.32em] text-sky-200 sm:text-xs sm:tracking-[0.25em]">Discover . Learn . Grow</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((current) => !current);
            }}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 xl:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="hidden w-full flex-col gap-3 xl:flex xl:w-auto xl:min-w-0 xl:flex-1 xl:flex-row xl:items-center xl:justify-end xl:gap-4">
          <nav className="grid w-full grid-cols-1 gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-1.5 sm:grid-cols-3 sm:max-w-xl xl:w-auto xl:min-w-[340px] xl:flex-none">
            {links.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2.5 text-center text-sm font-medium transition sm:px-5 ${
                    isActive ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={`fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm transition duration-300 xl:hidden ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />

        <div
          className={`fixed inset-y-0 left-0 z-[80] flex h-dvh w-[88vw] max-w-[22rem] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.45)] backdrop-blur-xl transition duration-300 xl:hidden ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-200">Navigation</p>
              <p className="mt-2 text-lg font-semibold text-white">Browse AI Gyan</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
            <nav className="grid gap-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-1.5">
              {links.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-3 text-center text-sm font-medium transition ${
                      isActive ? "bg-sky-500 text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
