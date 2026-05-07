import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Siren, Clock3, AlertTriangle } from "lucide-react";

export default function EscalationPanel() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/escalation/status").then((res) => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="mb-5 flex items-center gap-2">
        <Siren className="text-red-300" />
        <h3 className="text-xl font-black">Auto Escalation Engine</h3>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-red-500/10 p-4 text-center">
          <h4 className="text-2xl font-black text-red-300">{data.totalEscalated}</h4>
          <p className="text-xs text-slate-400">Escalated</p>
        </div>
        <div className="rounded-2xl bg-orange-500/10 p-4 text-center">
          <h4 className="text-2xl font-black text-orange-300">{data.atRisk}</h4>
          <p className="text-xs text-slate-400">At Risk</p>
        </div>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        Reports auto-escalate after {data.deadlineDays} days without resolution.
        Emails are sent to ward representatives automatically.
      </p>

      {data.escalatedReports.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-red-300">Escalated Issues:</p>
          {data.escalatedReports.slice(0, 3).map((r) => (
            <div key={r._id} className="rounded-2xl bg-red-500/10 p-3">
              <p className="font-semibold text-sm">{r.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <AlertTriangle size={12} className="text-red-300" />
                {r.ward} • {r.daysSinceReport} days overdue
              </div>
            </div>
          ))}
        </div>
      )}

      {data.atRiskReports.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-orange-300">At Risk (escalating soon):</p>
          {data.atRiskReports.slice(0, 3).map((r) => (
            <div key={r._id} className="rounded-2xl bg-orange-500/10 p-3">
              <p className="font-semibold text-sm">{r.title}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <Clock3 size={12} className="text-orange-300" />
                {r.daysRemaining > 0 ? `${r.daysRemaining} days left` : "Escalating..."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
