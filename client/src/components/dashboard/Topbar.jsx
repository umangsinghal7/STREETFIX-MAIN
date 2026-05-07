import { Bell, Sparkles } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <div className="glass mb-8 flex items-center justify-between rounded-[28px] p-5">
      <div>
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <Sparkles size={18} />
          Smart Civic Intelligence
        </div>
        <h2 className="text-3xl font-black">
          Welcome, {user?.name?.split(" ")[0] || "User"} 👋
        </h2>
        <p className="mt-1 text-slate-400">Monitor civic issues in real-time</p>
      </div>

      <div className="flex items-center gap-4">
        <button className="glass rounded-2xl p-4">
          <Bell />
        </button>
        <img
          src={`https://ui-avatars.com/api/?name=${user?.name || "User"}&background=06b6d4&color=fff`}
          className="h-14 w-14 rounded-2xl object-cover"
        />
      </div>
    </div>
  );
}
