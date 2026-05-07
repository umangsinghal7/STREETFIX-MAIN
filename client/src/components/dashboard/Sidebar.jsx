import {
  LayoutDashboard,
  MapPinned,
  ClipboardList,
  Bell,
  Trophy,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function Sidebar({ onReportClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const menu = [
    { icon: LayoutDashboard, label: "Dashboard", action: () => { navigate("/dashboard"); scrollTo("section-stats"); } },
    { icon: Trophy, label: "Leaderboard", action: () => navigate("/leaderboard") },
    { icon: BarChart3, label: "Analytics", action: () => { navigate("/dashboard"); setTimeout(() => scrollTo("section-analytics"), 100); } },
    { icon: MapPinned, label: "Report Issue", action: () => { if (onReportClick) onReportClick(); else if (window.__streetfix_openReport) window.__streetfix_openReport(); } },
    { icon: ClipboardList, label: "My Complaints", action: () => { navigate("/dashboard"); setTimeout(() => scrollTo("section-complaints"), 100); } },
    { icon: Settings, label: "Settings", action: () => navigate("/dashboard") },
  ];

  return (
    <aside className="glass hidden w-[280px] flex-col border-r border-white/10 lg:flex">
      <div className="border-b border-white/10 p-8">
        <h1 className="text-3xl font-black text-white">
          Street<span className="text-cyan-300">Fix</span>
        </h1>
      </div>

      <div className="flex-1 space-y-2 p-5">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex w-full items-center gap-4 rounded-2xl bg-red-500/15 px-5 py-4 text-red-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
