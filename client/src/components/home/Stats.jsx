import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, Trophy } from "lucide-react";

const stats = [
  {
    icon: AlertTriangle,
    value: "12,840+",
    label: "Issues Reported",
    color: "text-orange-300",
  },
  {
    icon: CheckCircle2,
    value: "9,210+",
    label: "Issues Fixed",
    color: "text-emerald-300",
  },
  {
    icon: Clock3,
    value: "36 hrs",
    label: "Average Resolution",
    color: "text-cyan-300",
  },
  {
    icon: Trophy,
    value: "Ward 18",
    label: "Top Performing Ward",
    color: "text-yellow-300",
  },
];

export default function Stats() {
  return (
    <section className="px-6 pb-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass rounded-[28px] p-6 transition hover:-translate-y-2"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <h3 className={`text-3xl font-black ${stat.color}`}>
                  {stat.value}
                </h3>
                <p className="mt-2 text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
