import { useEffect, useState } from "react";
import api from "../lib/axios";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Clock3 } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";

export default function LeaderboardPage() {
  const [wards, setWards] = useState([]);

  useEffect(() => {
    api.get("/api/wards/leaderboard/live").then((res) => setWards(res.data)).catch(() => {});
  }, []);

  const badge = (i) => {
    if (i === 0) return <Trophy className="text-yellow-300" />;
    if (i === 1) return <Medal className="text-slate-300" />;
    if (i === 2) return <Award className="text-orange-300" />;
    return <span className="font-bold text-slate-400">#{i + 1}</span>;
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-10">
        <Topbar />

        <h1 className="mb-8 text-5xl font-black">Ward Leaderboard</h1>
        <p className="mb-6 text-slate-400">
          Live rankings calculated from actual report resolution data. Updated in real-time.
        </p>

        <div className="space-y-4">
          {wards.map((ward, i) => (
            <div
              key={ward._id}
              className="glass flex items-center justify-between rounded-[28px] p-6"
            >
              <div className="flex items-center gap-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/5">
                  {badge(i)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{ward.name}</h3>
                  <p className="text-slate-400">
                    {ward.representative} • {ward.resolved}/{ward.total} resolved
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Avg Fix</p>
                  <div className="flex items-center gap-1 text-sm text-slate-300">
                    <Clock3 size={14} />
                    {ward.avgResolutionHours ? `${ward.avgResolutionHours}h` : "N/A"}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-400">Satisfaction</p>
                  <p className="text-sm text-emerald-300">{ward.satisfaction}%</p>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <h3 className="text-3xl font-black text-cyan-300">
                      {ward.liveScore}
                    </h3>
                    <p className="text-xs text-slate-400">Score</p>
                  </div>
                  {ward.trend === "up" ? (
                    <TrendingUp size={18} className="text-emerald-300" />
                  ) : (
                    <TrendingDown size={18} className="text-red-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
