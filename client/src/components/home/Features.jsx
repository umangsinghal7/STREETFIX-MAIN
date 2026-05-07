import { motion } from "framer-motion";
import {
  Brain,
  Mic,
  ShieldCheck,
  Siren,
  BarChart3,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Issue Detection",
    desc: "Upload a photo and AI automatically detects potholes, broken lights, garbage overflow and severity level.",
    color: "text-cyan-300",
    glow: "bg-cyan-400/15",
  },
  {
    icon: Mic,
    title: "Voice Complaint Filing",
    desc: "Citizens can report issues in Hindi, English or local language with voice-to-text support.",
    color: "text-purple-300",
    glow: "bg-purple-400/15",
  },
  {
    icon: ShieldCheck,
    title: "Citizen Verification",
    desc: "Authorities upload fix proof. Nearby citizens verify if issue is actually resolved.",
    color: "text-emerald-300",
    glow: "bg-emerald-400/15",
  },
  {
    icon: Siren,
    title: "Auto Escalation Engine",
    desc: "If deadlines are missed, complaint escalates automatically to higher officials.",
    color: "text-red-300",
    glow: "bg-red-400/15",
  },
  {
    icon: BarChart3,
    title: "Civic Analytics",
    desc: "Heatmaps, issue density, resolution trends and department performance dashboards.",
    color: "text-orange-300",
    glow: "bg-orange-400/15",
  },
  {
    icon: Trophy,
    title: "Ward Leaderboards",
    desc: "Public ranking of wards based on response time, citizen satisfaction and transparency score.",
    color: "text-yellow-300",
    glow: "bg-yellow-400/15",
  },
];

export default function Features() {
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
            PLATFORM CAPABILITIES
          </p>
          <h2 className="text-4xl font-black lg:text-5xl">
            Built for
            <span className="block text-cyan-300">Modern Governance</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Advanced civic intelligence tools that make reporting, resolving,
            and verifying infrastructure issues seamless.
          </p>
        </motion.div>

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glass group rounded-[32px] p-7 transition hover:-translate-y-2"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl ${feature.glow}`}
                >
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="mb-4 text-xl font-bold">{feature.title}</h3>
                <p className="leading-8 text-slate-400">{feature.desc}</p>
                <div className="mt-6 h-[2px] w-0 bg-cyan-300 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
