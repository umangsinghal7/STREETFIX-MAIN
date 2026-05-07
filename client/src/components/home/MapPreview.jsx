import { motion } from "framer-motion";
import { MapPin, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

const issues = [
  {
    title: "Large pothole near school",
    ward: "Ward 12",
    status: "Urgent",
    icon: AlertTriangle,
    color: "text-red-300",
    bg: "bg-red-400/15",
  },
  {
    title: "Streetlight repaired",
    ward: "Ward 07",
    status: "Resolved",
    icon: CheckCircle2,
    color: "text-emerald-300",
    bg: "bg-emerald-400/15",
  },
  {
    title: "Garbage overflow",
    ward: "Ward 04",
    status: "Pending",
    icon: Clock3,
    color: "text-orange-300",
    bg: "bg-orange-400/15",
  },
];

export default function MapPreview() {
  return (
    <section className="px-6 pb-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            LIVE TRANSPARENCY MAP
          </p>
          <h2 className="text-4xl font-black lg:text-5xl">
            See Problems
            <span className="block text-cyan-300">Across Your City</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Every report becomes a public pin on the city map, creating
            accountability and complete visibility for everyone.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass relative min-h-[550px] overflow-hidden rounded-[36px] border border-white/10"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)
                `,
                backgroundSize: "60px 60px",
              }}
            />
            <div className="absolute left-[18%] top-[28%] h-44 w-44 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute right-[18%] top-[22%] h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="absolute left-[40%] bottom-[20%] h-52 w-52 rounded-full bg-orange-400/15 blur-3xl" />

            <div className="absolute left-[12%] top-[20%] h-[4px] w-[65%] rotate-12 rounded-full bg-white/10" />
            <div className="absolute left-[8%] top-[55%] h-[4px] w-[75%] -rotate-12 rounded-full bg-white/10" />
            <div className="absolute left-[45%] top-[10%] h-[70%] w-[4px] rounded-full bg-white/10" />

            {[
              { top: "22%", left: "24%", color: "text-red-300" },
              { top: "48%", left: "62%", color: "text-cyan-300" },
              { top: "68%", left: "38%", color: "text-orange-300" },
              { top: "35%", left: "78%", color: "text-emerald-300" },
            ].map((pin, i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                className="absolute"
                style={{ top: pin.top, left: pin.left }}
              >
                <div className="absolute inset-0 rounded-full bg-cyan-300/30 blur-xl scale-[2]" />
                <MapPin className={`relative h-10 w-10 ${pin.color}`} />
              </motion.div>
            ))}

            <div className="absolute left-6 top-6 glass rounded-2xl px-5 py-3">
              <p className="text-sm text-slate-400">Active reports</p>
              <h4 className="text-2xl font-black text-cyan-300">1,248</h4>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            {issues.map((issue, index) => {
              const Icon = issue.icon;
              return (
                <div
                  key={index}
                  className="glass rounded-[28px] p-6 transition hover:-translate-y-1"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${issue.bg}`}
                    >
                      <Icon className={`h-7 w-7 ${issue.color}`} />
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${issue.bg} ${issue.color}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                  <h3 className="font-semibold">{issue.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{issue.ward}</p>
                </div>
              );
            })}

            <div className="glass rounded-[28px] p-6">
              <p className="text-sm text-slate-400">Average fix score</p>
              <h3 className="mt-2 text-4xl font-black text-emerald-300">
                82/100
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
