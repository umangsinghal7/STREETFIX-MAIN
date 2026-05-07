import { motion } from "framer-motion";
import { ArrowRight, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="px-6 pb-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass relative overflow-hidden rounded-[40px] px-8 py-16 text-center lg:px-20"
        >
          <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute right-10 bottom-10 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-cyan-400/15">
              <MapPinned className="h-10 w-10 text-cyan-300" />
            </div>

            <h2 className="text-4xl font-black lg:text-6xl">
              Your Street.
              <span className="block text-cyan-300">Your Voice.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Join citizens building transparent, accountable, data-driven local
              governance—one report at a time.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/auth"
                className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-8 py-4 font-semibold text-slate-950 transition hover:scale-105 hover:bg-cyan-300"
              >
                Report Issue
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/dashboard"
                className="glass rounded-2xl px-8 py-4 font-semibold hover:border-cyan-300/30"
              >
                View Live Map
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
