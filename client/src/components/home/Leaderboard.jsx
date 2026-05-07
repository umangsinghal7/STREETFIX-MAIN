import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Clock3, Smile } from "lucide-react";

const wards = [
  { rank: 1, name: "Ward 18", score: 96, time: "18 hrs", satisfaction: "98%", trend: "up" },
  { rank: 2, name: "Ward 07", score: 90, time: "26 hrs", satisfaction: "92%", trend: "up" },
  { rank: 3, name: "Ward 12", score: 84, time: "34 hrs", satisfaction: "88%", trend: "down" },
  { rank: 4, name: "Ward 04", score: 62, time: "72 hrs", satisfaction: "58%", trend: "down" },
];

export default function Leaderboard() {
  return (
    <section className="px-6 pb-28 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            PUBLIC ACCOUNTABILITY
          </p>
          <h2 className="text-4xl font-black lg:text-5xl">
            Ward Performance
            <span className="block text-cyan-300">Leaderboard</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Transparent rankings based on civic response time, citizen
            satisfaction and issue resolution efficiency.
          </p>
        </motion.div>

        <div className="glass overflow-hidden rounded-[36px]">
          <div className="grid grid-cols-5 border-b border-white/10 px-8 py-6 text-sm font-semibold text-slate-400">
            <div>Rank</div>
            <div>Ward</div>
            <div>Score</div>
            <div>Avg Fix</div>
            <div>Satisfaction</div>
          </div>

          {wards.map((ward, index) => (
            <motion.div
              key={ward.rank}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="grid grid-cols-5 items-center border-b border-white/5 px-8 py-6 transition hover:bg-white/5"
            >
              <div className="flex items-center gap-3 font-bold">
                {ward.rank === 1 && <Trophy className="h-5 w-5 text-yellow-300" />}
                #{ward.rank}
              </div>
              <div className="font-semibold">{ward.name}</div>
              <div>
                <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-cyan-300 font-semibold">
                  {ward.score}/100
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock3 size={16} />
                {ward.time}
              </div>
              <div className="flex items-center gap-3">
                <Smile size={16} className="text-emerald-300" />
                {ward.satisfaction}
                {ward.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-emerald-300" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-300" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
