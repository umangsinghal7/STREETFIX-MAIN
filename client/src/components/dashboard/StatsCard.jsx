import { motion } from "framer-motion";

export default function StatsCard({ title, value, color, sub }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="glass rounded-[30px] p-6">
      <p className="text-slate-400">{title}</p>
      <h3 className={`mt-3 text-4xl font-black ${color}`}>{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{sub}</p>
    </motion.div>
  );
}
