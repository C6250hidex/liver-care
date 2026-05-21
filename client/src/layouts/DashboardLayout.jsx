import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  User,
  ClipboardList,
  LogOut,
  Search,
  Activity,
  Menu,
  X,
  Bell,
  ChevronRight,
  Stethoscope,
  Moon,
  Sun,
  Calendar,
  Users,
  Settings,
} from "lucide-react";

// ── Role-Based Nav Config ─────────────────────────────────────────────────────

const PATIENT_LINKS = [
  { to: "/dashboard/patient", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/patient/profile", icon: User, label: "My Profile" },
  {
    to: "/dashboard/patient/records",
    icon: ClipboardList,
    label: "Daily Logs",
  },
  { to: "/dashboard/patient/doctors", icon: Search, label: "Find Doctors" },
  {
    to: "/dashboard/patient/appointments",
    icon: Calendar,
    label: "Appointments",
  },
  { to: "/dashboard/patient/history", icon: Activity, label: "AI History" },
  {
    to: "/dashboard/patient/symptom-checker",
    icon: Stethoscope,
    label: "Symptom Checker",
  },
];

const DOCTOR_LINKS = [
  {
    to: "/dashboard/doctor",
    icon: LayoutDashboard,
    label: "Clinical Overview",
  },
  {
    to: "/dashboard/doctor/schedule",
    icon: Calendar,
    label: "Patient Schedule",
  },
  { to: "/dashboard/doctor/patients", icon: Users, label: "My Patients" },
  {
    to: "/dashboard/doctor/blogs",
    icon: ClipboardList,
    label: "Publish Article",
  },
  { to: "/dashboard/doctor/profile", icon: User, label: "Medical Profile" },
];

const ADMIN_LINKS = [
  { to: "/dashboard/admin", icon: LayoutDashboard, label: "System Overview" },
  { to: "/dashboard/admin/users", icon: Users, label: "Manage Users" },
  {
    to: "/dashboard/admin/blogs",
    icon: ClipboardList,
    label: "Blog Moderation",
  },
  {
    to: "/dashboard/admin/settings",
    icon: Settings,
    label: "Platform Settings",
  },
];
// ── NavLink Component ────────────────────────────────────────────────────────

const NavLink = ({ to, icon: Icon, label, onClick }) => {
  const location = useLocation();

  // Highlighting logic: exactly match or is a sub-route
  const active =
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
        ${
          active
            ? "bg-medical-primary text-white shadow-md shadow-medical-primary/20"
            : "text-medical-lightMuted dark:text-medical-darkMuted hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-medical-lightText dark:hover:text-medical-darkText"
        }
      `}
    >
      <Icon
        size={18}
        className={
          active
            ? "text-white"
            : "text-medical-lightMuted dark:text-medical-darkMuted group-hover:text-medical-primary transition-colors"
        }
      />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight size={14} className="opacity-70" />}
    </Link>
  );
};

const SidebarContent = ({
  user,
  initials,
  currentNavLinks,
  setSidebarOpen,
  handleLogout,
  dark,
  setDark,
}) => (
  <>
    <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-medical-primary flex items-center justify-center shadow-sm">
          <Stethoscope size={16} className="text-white" />
        </div>
        <span className="text-base font-bold text-medical-lightText dark:text-medical-darkText tracking-tight">
          LiverCare{" "}
          <span className="text-[10px] text-medical-primary uppercase">
            Pro
          </span>
        </span>
      </div>
      <button
        onClick={() => setSidebarOpen(false)}
        className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <X size={18} />
      </button>
    </div>

    <div className="px-4 py-4 border-b border-gray-100 dark:border-slate-800">
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-transparent dark:border-slate-800">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-primary to-medical-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-medical-lightText dark:text-medical-darkText truncate">
            {user.fullname}
          </p>
          <p className="text-[10px] font-bold text-medical-primary uppercase tracking-widest">
            {user.role}
          </p>
        </div>
      </div>
    </div>

    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      {currentNavLinks.map((link) => (
        <NavLink key={link.to} {...link} />
      ))}
    </nav>

    <div className="px-3 py-4 border-t border-gray-100 dark:border-slate-800 space-y-1">
      <button
        onClick={() => setDark((d) => !d)}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-medical-lightMuted dark:text-medical-darkMuted hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        {dark ? (
          <Sun size={18} className="text-amber-500" />
        ) : (
          <Moon size={18} />
        )}
        <span>{dark ? "Light Mode" : "Dark Mode"}</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  </>
);

// ── DarkMode Hook ───────────────────────────────────────────────────────────

const useDarkMode = () => {
  const [dark, setDark] = useState(
    () =>
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark",
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark];
};

// ── Main Layout ──────────────────────────────────────────────────────────────

const DashboardLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const sidebarRef = useRef(null);

  const { user, logout } = useAuth();

  // 2. Select links based on role
  const currentNavLinks =
    user.role === "admin"
      ? ADMIN_LINKS
      : user.role === "doctor"
        ? DOCTOR_LINKS
        : PATIENT_LINKS;

  const initials = user?.fullname
    ? user.fullname
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "LC";

  // Side-effect: Close sidebar on navigation
  useEffect(() => {
    if (!sidebarOpen) return;
    const timer = window.setTimeout(() => setSidebarOpen(false), 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, sidebarOpen]);

  // Handle outside clicks
  useEffect(() => {
    const handler = (e) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
  };

  const currentPage = currentNavLinks.find(
    (l) =>
      location.pathname === l.to || location.pathname.startsWith(l.to + "/"),
  );

  return (
    <div className="flex h-screen bg-medical-lightBg dark:bg-medical-darkBg overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col bg-medical-lightSurface dark:bg-medical-darkSurface border-r border-gray-100 dark:border-slate-800">
        <SidebarContent
          user={user}
          initials={initials}
          currentNavLinks={currentNavLinks}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
          dark={dark}
          setDark={setDark}
        />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-medical-lightSurface dark:bg-medical-darkSurface border-r border-gray-100 dark:border-slate-800 shadow-2xl md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent
          user={user}
          initials={initials}
          currentNavLinks={currentNavLinks}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
          dark={dark}
          setDark={setDark}
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 sm:h-16 shrink-0 bg-medical-lightSurface dark:bg-medical-darkSurface border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-medical-lightText dark:text-medical-darkText hover:text-medical-primary transition-colors"
              title="Open menu"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[10px] font-black text-medical-primary uppercase tracking-tighter leading-none mb-1">
                {user.role} Portal
              </p>
              <h2 className="text-sm sm:text-base font-bold text-medical-lightText dark:text-medical-darkText leading-tight">
                {currentPage?.label ?? "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-medical-lightMuted transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-medical-danger border-2 border-white dark:border-slate-900" />
            </button>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-medical-primary to-medical-accent text-white flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm">
              {initials}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </section>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden shrink-0 bg-medical-lightSurface dark:bg-medical-darkSurface border-t border-gray-100 dark:border-slate-800 flex items-center justify-around px-1 py-1 pb-safe">
          {currentNavLinks.slice(0, 4).map(({ to, icon: Icon, label }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 ${active ? "text-medical-primary" : "text-medical-lightMuted dark:text-medical-darkMuted"}`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-bold truncate max-w-[60px]">
                  {label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-medical-lightMuted dark:text-medical-darkMuted"
          >
            <Menu size={20} />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default DashboardLayout;
