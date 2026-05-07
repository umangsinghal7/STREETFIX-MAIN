import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-24 lg:px-12">
      <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-10 top-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
            <Sparkles size={16} />
            Hyper-local governance powered by citizens
          </div>

          <h1 className="text-5xl font-black leading-tight lg:text-7xl">
            Report Civic
            <span className="block text-cyan-300">Problems Publicly</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Pin potholes, broken streetlights, garbage overflow and more. Track
            public fixes with complete transparency, accountability, and citizen
            verification.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/auth"
              className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-7 py-4 font-semibold text-slate-950 transition hover:scale-105 hover:bg-cyan-300"
            >
              Report Issue
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/dashboard"
              className="glass rounded-2xl px-7 py-4 font-semibold hover:border-cyan-300/30"
            >
              Explore Map
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-emerald-300">
            <ShieldCheck size={18} />
            100% public accountability timeline
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="glass rounded-[32px] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Live Civic Feed</h3>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-300">
                LIVE
              </span>
            </div>

            <div className="space-y-4">
              {[
                ["Pothole reported", "Ward 12", "Urgent"],
                ["Streetlight fixed", "Ward 7", "Resolved"],
                ["Garbage overflow", "Ward 4", "Pending"],
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{item[0]}</p>
                    <p className="text-sm text-slate-400">{item[1]}</p>
                  </div>
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs text-cyan-300">
                    {item[2]}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-4 text-center">
                <h4 className="text-2xl font-bold text-cyan-300">1.2k</h4>
                <p className="text-xs text-slate-400">Reports</p>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <h4 className="text-2xl font-bold text-emerald-300">860</h4>
                <p className="text-xs text-slate-400">Resolved</p>
              </div>
              <div className="glass rounded-2xl p-4 text-center">
                <h4 className="text-2xl font-bold text-orange-300">48h</h4>
                <p className="text-xs text-slate-400">Avg Fix</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
