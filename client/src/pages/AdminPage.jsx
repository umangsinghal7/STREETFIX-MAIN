import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Clock, MapPin, AlertTriangle, CheckCircle2, Upload, ChevronDown,
  ChevronUp, Loader2, LogOut, LayoutDashboard, ClipboardList, BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";
import useAuthStore from "../store/useAuthStore";

const STATUS_COLORS = {
  open: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  escalated: "bg-red-500/20 text-red-300 border-red-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
}

function timeDiff(start, end) {
  const diff = new Date(end) - new Date(start);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function AdminPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchReports();
    api.get("/api/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const fetchReports = () => {
    api.get("/api/reports?limit=100").then((res) => {
      setReports(res.data.reports || []);
    }).catch(() => {});
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  const updateReport = async (id, status, afterImage, note) => {
    setUpdating(id);
    try {
      await api.patch(`/api/reports/${id}/update`, { status, afterImage, note });
      toast.success(`Report updated to ${status}`);
      fetchReports();
      setExpanded(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* Sidebar */}
      <aside className="glass hidden w-[260px] flex-col border-r border-white/10 lg:flex">
        <div className="border-b border-white/10 p-6">
          <h1 className="text-2xl font-black">
            Street<span className="text-cyan-300">Fix</span>
          </h1>
          <p className="text-xs text-orange-300 mt-1 flex items-center gap-1">
            <Shield size={12} /> Admin Panel
          </p>
        </div>
        <div className="flex-1 space-y-2 p-4">
          {[
            { icon: LayoutDashboard, label: "All Reports", f: "all" },
            { icon: AlertTriangle, label: "Open", f: "open" },
            { icon: Clock, label: "In Progress", f: "in_progress" },
            { icon: AlertTriangle, label: "Escalated", f: "escalated" },
            { icon: CheckCircle2, label: "Resolved", f: "resolved" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.f}
                onClick={() => setFilter(item.f)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  filter === item.f ? "bg-cyan-400 text-black font-bold" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {item.label}
                <span className="ml-auto text-xs opacity-70">
                  {item.f === "all" ? reports.length : reports.filter((r) => r.status === item.f).length}
                </span>
              </button>
            );
          })}
        </div>
        <div className="p-4">
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="flex w-full items-center gap-3 rounded-xl bg-red-500/15 px-4 py-3 text-red-300 text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Admin Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">Welcome, {user?.name || "Admin"} • Manage all civic reports</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Open", value: stats.open, color: "text-yellow-300" },
              { label: "In Progress", value: stats.inProgress, color: "text-blue-300" },
              { label: "Escalated", value: stats.escalated, color: "text-red-300" },
              { label: "Resolved", value: stats.resolved, color: "text-emerald-300" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-2xl p-4 text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-slate-500 py-12">No reports in this category</p>
          )}
          {filtered.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              isOpen={expanded === report._id}
              onToggle={() => setExpanded(expanded === report._id ? null : report._id)}
              onUpdate={updateReport}
              updating={updating === report._id}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function ReportCard({ report, isOpen, onToggle, onUpdate, updating }) {
  const [status, setStatus] = useState(report.status);
  const [note, setNote] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAfterImage(res.data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${STATUS_COLORS[report.status].split(" ")[2] || "border-white/10"} bg-white/[0.03] overflow-hidden`}>
      {/* Header */}
      <button onClick={onToggle} className="w-full p-4 flex items-center gap-3 text-left">
        <div className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${STATUS_COLORS[report.status]}`}>
          {report.status?.replace("_", " ")}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{report.title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            {report.ward} • <span className="capitalize">{report.category?.replace("_", " ")}</span> • Reported {timeAgo(report.createdAt)}
            {report.reportedBy?.name && <span> by {report.reportedBy.name}</span>}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-500">
            {report.resolvedAt ? (
              <span className="text-emerald-400">Solved in {timeDiff(report.createdAt, report.resolvedAt)}</span>
            ) : (
              <span className="text-orange-400">Pending {timeDiff(report.createdAt, new Date())}</span>
            )}
          </p>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 border-t border-white/5 pt-4 space-y-4">
              {/* Description */}
              {report.description && (
                <p className="text-sm text-slate-300">{report.description}</p>
              )}

              {/* Location */}
              {report.location?.address && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={12} /> {report.location.address}
                </div>
              )}

              {/* Images */}
              <div className="flex gap-4">
                {report.beforeImage && (
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 mb-1">Before</p>
                    <img src={report.beforeImage} className="h-32 w-48 object-cover rounded-xl" alt="before" />
                  </div>
                )}
                {report.afterImage && (
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 mb-1">After (Fixed)</p>
                    <img src={report.afterImage} className="h-32 w-48 object-cover rounded-xl" alt="after" />
                  </div>
                )}
              </div>

              {/* Timeline */}
              {report.timeline?.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase text-slate-500 mb-2">Timeline</p>
                  <div className="space-y-1.5">
                    {report.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="text-slate-300">{t.description}</span>
                        <span className="text-slate-500 ml-auto shrink-0">{timeAgo(t.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {report.status !== "resolved" && (
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <p className="text-xs uppercase text-orange-300 font-bold">Admin Actions</p>

                  {/* Status selector */}
                  <div className="flex gap-2 flex-wrap">
                    {["open", "in_progress", "resolved"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                          status === s ? "bg-cyan-400 text-black" : "bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {/* After image upload (show when resolving or marking in_progress) */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer rounded-xl bg-white/5 border border-dashed border-white/20 p-3 hover:bg-white/10 transition">
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin text-cyan-300" />
                      ) : (
                        <Upload size={16} className="text-cyan-300" />
                      )}
                      <span className="text-xs text-slate-300">
                        {afterImage ? "✓ Photo uploaded" : (status === "resolved" ? "Upload fix verification photo (required)" : "Upload progress photo (optional)")}
                      </span>
                      <input hidden type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                    </label>
                    {afterImage && (
                      <img src={afterImage} className="mt-2 h-20 w-32 object-cover rounded-lg" alt="fix" />
                    )}
                  </div>

                  {/* Note */}
                  <input
                    type="text"
                    placeholder="Add a note (e.g., Crew dispatched, Fixed with cement)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl bg-white/5 px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-cyan-400/50"
                  />

                  {/* Submit */}
                  <button
                    onClick={() => onUpdate(report._id, status, afterImage, note)}
                    disabled={updating || status === report.status}
                    className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-cyan-300 disabled:opacity-40"
                  >
                    {updating && <Loader2 size={14} className="animate-spin" />}
                    Update Report
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
