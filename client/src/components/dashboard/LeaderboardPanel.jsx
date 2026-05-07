import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export default function LeaderboardPanel() {
  const [wards, setWards] = useState([]);

  useEffect(() => {
    api
      .get("/api/wards/leaderboard/live")
      .then((res) => setWards(res.data.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="mb-5 flex items-center gap-2">
        <Trophy className="text-yellow-300" />
        <h3 className="text-xl font-black">Ward Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {wards.map((w, i) => (
          <div
            key={w._id}
            className="flex items-center justify-between rounded-2xl bg-white/5 p-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-400">#{i + 1}</span>
              <div>
                <p className="font-semibold text-sm">{w.name}</p>
                <p className="text-xs text-slate-500">{w.resolved}/{w.total} resolved</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 font-bold">{w.liveScore}</span>
              {w.trend === "up" ? (
                <TrendingUp size={14} className="text-emerald-300" />
              ) : (
                <TrendingDown size={14} className="text-red-300" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
