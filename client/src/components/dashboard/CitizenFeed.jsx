import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Sparkles } from "lucide-react";

export default function CitizenFeed() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/api/reports").then((res) => {
      setData((res.data.reports || []).slice(0, 5));
    }).catch(() => {});
  }, []);

  return (
    <div className="glass rounded-[32px] p-6">
      <div className="mb-5 flex items-center gap-2 text-cyan-300">
        <Sparkles size={18} />
        <h3 className="text-xl font-black">Live Civic Activity</h3>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item._id} className="rounded-2xl bg-white/5 p-4">
            <p className="font-semibold">{item.title}</p>
            <p className="mt-1 text-sm capitalize text-slate-400">
              {item.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
