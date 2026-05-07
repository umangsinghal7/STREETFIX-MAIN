import { motion } from "framer-motion";
import { MapPinned } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

export default function Navbar() {
  const { token } = useAuthStore();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/15">
            <MapPinned className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">
              Street<span className="text-cyan-300">Fix</span>
            </h1>
            <p className="text-xs text-slate-400">Civic Transparency Platform</p>
          </div>
        </Link>

        <div className="flex gap-3">
          {isHome ? (
            <>
              <Link
                to="/auth"
                className="rounded-xl border border-white/10 px-5 py-2.5 text-white hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950"
              >
                Register
              </Link>
            </>
          ) : token ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
