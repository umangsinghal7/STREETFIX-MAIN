import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { ThumbsUp, Clock3, Flame } from "lucide-react";
import toast from "react-hot-toast";

export default function TrendingComplaints() {
  const [data, setData] = useState([]);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/reports");
      const sorted = (res.data.reports || []).sort(
        (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
      );
      setData(sorted.slice(0, 5));
    } catch {
      setData([]);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const vote = async (id) => {
    try {
      await api.post(`/api/reports/${id}/upvote`);
      toast.success("Supported issue");
      fetchReports();
    } catch {
      toast.error("Already voted");
    }
  };

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="mb-6 flex items-center gap-3">
        <Flame className="text-orange-300" />
        <h3 className="text-2xl font-black">Trending Complaints</h3>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div
            key={item._id}
            className="rounded-[26px] bg-white/5 p-5 transition hover:bg-white/10"
          >
            <h4 className="font-bold">{item.title}</h4>
            <p className="mt-1 text-sm capitalize text-slate-400">
              {item.category}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock3 size={16} />
                {item.daysSinceReport || 0}d ago
              </div>

              <button
                onClick={() => vote(item._id)}
                className="flex items-center gap-2 rounded-full bg-cyan-400/15 px-4 py-2 text-cyan-300"
              >
                <ThumbsUp size={16} />
                {item.upvotes?.length || 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
