import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, AlertTriangle, CheckCircle2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../lib/axios";

const STATUS_COLORS = {
  open: "bg-yellow-500/20 text-yellow-300",
  in_progress: "bg-blue-500/20 text-blue-300",
  escalated: "bg-red-500/20 text-red-300",
  resolved: "bg-emerald-500/20 text-emerald-300",
};

const STATUS_ICONS = {
  open: AlertTriangle,
  in_progress: Clock,
  escalated: AlertTriangle,
  resolved: CheckCircle2,
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

export default function MyComplaints() {
  const [data, setData] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/api/reports/mine").then((res) => {
      setData(res.data.reports || []);
    }).catch(() => {
      // Fallback to all reports if mine endpoint fails
      api.get("/api/reports").then((res) => setData(res.data.reports || [])).catch(() => {});
    });
  }, []);

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-black">My Complaints</h3>
        <span className="text-sm text-slate-400">{data.length} total</span>
      </div>

      <div className="space-y-3">
        {data.length === 0 && (
          <p className="text-center text-slate-500 py-8">No complaints yet. Report an issue from the map!</p>
        )}
        {data.map((item) => {
          const StatusIcon = STATUS_ICONS[item.status] || AlertTriangle;
          const isOpen = expanded === item._id;
          return (
            <div key={item._id} className="rounded-[20px] bg-white/5 overflow-hidden transition hover:bg-white/[0.07]">
              {/* Header row */}
              <button
                onClick={() => toggle(item._id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={`shrink-0 p-2 rounded-xl ${STATUS_COLORS[item.status]}`}>
                  <StatusIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.ward} • <span className="capitalize">{item.category?.replace("_", " ")}</span> • {timeAgo(item.createdAt)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[item.status]}`}>
                  {item.status?.replace("_", " ")}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-white/5 pt-3">
                      {item.description && (
                        <p className="text-sm text-slate-300 mb-3">{item.description}</p>
                      )}

                      {/* Images */}
                      <div className="flex gap-3 mb-3">
                        {item.beforeImage && (
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-500 uppercase mb-1">Before</p>
                            <img src={item.beforeImage} className="w-full h-24 object-cover rounded-xl" alt="before" />
                          </div>
                        )}
                        {item.afterImage && (
                          <div className="flex-1">
                            <p className="text-[10px] text-slate-500 uppercase mb-1">After (Fixed)</p>
                            <img src={item.afterImage} className="w-full h-24 object-cover rounded-xl" alt="after" />
                          </div>
                        )}
                      </div>

                      {/* Location */}
                      {item.location?.address && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                          <MapPin size={12} /> {item.location.address}
                        </div>
                      )}

                      {/* Time to solve */}
                      {item.resolvedAt && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-3">
                          <CheckCircle2 size={12} /> Resolved in {timeDiff(item.createdAt, item.resolvedAt)}
                        </div>
                      )}
                      {!item.resolvedAt && item.status !== 'resolved' && (
                        <div className="flex items-center gap-1.5 text-xs text-orange-400 mb-3">
                          <Clock size={12} /> Pending for {timeDiff(item.createdAt, new Date())}
                        </div>
                      )}

                      {/* Timeline */}
                      {item.timeline && item.timeline.length > 0 && (
                        <div className="mt-3 border-t border-white/5 pt-3">
                          <p className="text-[10px] uppercase text-slate-500 mb-2">Timeline</p>
                          <div className="space-y-2">
                            {item.timeline.map((t, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
                                <div>
                                  <span className="text-slate-300">{t.description}</span>
                                  <span className="text-slate-500 ml-2">{timeAgo(t.timestamp)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Upvotes */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span>👍 {item.upvotes?.length || 0} upvotes</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
