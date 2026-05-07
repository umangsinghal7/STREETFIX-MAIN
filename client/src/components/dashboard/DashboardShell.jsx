import { useEffect, useState } from "react";
import api from "../../lib/axios";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import StatsCard from "./StatsCard";
import LiveMap from "./LiveMap";
import TrendingComplaints from "./TrendingComplaints";
import LeaderboardPanel from "./LeaderboardPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import MyComplaints from "./MyComplaints";
import CitizenFeed from "./CitizenFeed";
import EscalationPanel from "./EscalationPanel";
import ReportIssueModal from "./ReportIssueModal";

export default function DashboardShell() {
  const [stats, setStats] = useState({
    open: 0,
    resolved: 0,
    escalated: 0,
    avgResolutionDays: 0,
  });

  const [reportOpen, setReportOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/stats");

      console.log("Stats API:", res.data);

      setStats({
        open: res.data.open || 0,
        resolved: res.data.resolved || 0,
        escalated: res.data.escalated || 0,
        avgResolutionDays: res.data.avgResolutionDays || 0,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  useEffect(() => {
    window.__streetfix_openReport = () => setReportOpen(true);
    return () => {
      delete window.__streetfix_openReport;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar onReportClick={() => setReportOpen(true)} />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <Topbar />

        <div
          id="section-stats"
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          <StatsCard
            title="Open Issues"
            value={stats.open}
            color="text-cyan-300"
            sub="Live complaints"
          />

          <StatsCard
            title="Resolved"
            value={stats.resolved}
            color="text-emerald-300"
            sub="Verified fixes"
          />

          <StatsCard
            title="Avg Resolution"
            value={
              stats?.avgResolutionDays
                ? `${stats.avgResolutionDays}d`
                : "Not enough data"
            }
            color="text-orange-300"
            sub="Days to fix"
          />

          <StatsCard
            title="Estimated"
            value={
              stats?.estimatedDays
                ? `${stats.estimatedDays}d`
                : "Calculating..."
            }
            color="text-pink-300"
            sub="Expected resolution"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div id="section-map" className="glass rounded-[32px] p-6">
              <h3 className="mb-6 text-2xl font-black">City Live Grid</h3>
              <LiveMap />
            </div>

            <div id="section-analytics">
              <AnalyticsPanel />
            </div>

            <div id="section-complaints">
              <MyComplaints key={refreshKey} />
            </div>
          </div>

          <div className="space-y-6">
            <EscalationPanel />
            <TrendingComplaints />
            <CitizenFeed />
            <LeaderboardPanel />
          </div>
        </div>

        <ReportIssueModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          position={null}
          refresh={() => setRefreshKey((k) => k + 1)}
        />
      </main>
    </div>
  );
}