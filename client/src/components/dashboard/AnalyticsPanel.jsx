import { useEffect, useState } from "react";
import api from "../../lib/axios";

export default function AnalyticsPanel() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="glass rounded-[32px] p-6">
      <h3 className="mb-6 text-2xl font-black">Analytics</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-white/5 p-6">
          <p className="text-slate-400">Total Issues</p>
          <h2 className="mt-2 text-4xl font-black text-cyan-300">
            {stats.total}
          </h2>
        </div>

        <div className="rounded-3xl bg-white/5 p-6">
          <p className="text-slate-400">Escalated</p>
          <h2 className="mt-2 text-4xl font-black text-red-300">
            {stats.escalated}
          </h2>
        </div>

        <div className="rounded-3xl bg-white/5 p-6">
          <p className="text-slate-400">Resolved</p>
          <h2 className="mt-2 text-4xl font-black text-emerald-300">
            {stats.resolved}
          </h2>
        </div>
      </div>
    </div>
  );
}
