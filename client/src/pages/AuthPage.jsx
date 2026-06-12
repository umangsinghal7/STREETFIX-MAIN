import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative z-10 w-full max-w-5xl overflow-hidden rounded-[40px]"
      >
        <div className="grid md:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-cyan-400/10 to-blue-500/10 p-12 md:flex md:flex-col md:justify-center">
            <h1 className="text-5xl font-black">
              Street<span className="text-cyan-300">Fix</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Smart civic issue reporting platform built for transparency,
              accountability and faster resolution.
            </p>

            <div className="mt-10 space-y-4 text-slate-300">
              <p>✓ AI issue classification</p>
              <p>✓ Geo-tagged complaints</p>
              <p>✓ Public transparency board</p>
              <p>✓ Ward ranking leaderboard</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-10 grid grid-cols-2 rounded-2xl bg-white/5 p-1">
              <button
                onClick={() => setMode("login")}
                className={`rounded-2xl py-3 font-semibold transition ${mode === "login"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300"
                  }`}
              >
                Login
              </button>

              <button
                onClick={() => setMode("register")}
                className={`rounded-2xl py-3 font-semibold transition ${mode === "register"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300"
                  }`}
              >
                Register
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <LoginForm key="login" navigate={navigate} />
              ) : (
                <RegisterForm key="register" navigate={navigate} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ icon: Icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="glass mb-5 flex items-center gap-3 rounded-2xl px-4 py-4">
      <Icon className="text-cyan-300" size={20} />

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-white placeholder:text-slate-400 outline-none"
      />
    </div>
  );
}

function GoogleButton() {
  const googleLogin = () => {
    window.location.href =
  "https://streetfix-main.onrender.com/api/auth/google";
  };

  return (
    <button
      onClick={googleLogin}
      className="mb-5 flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition hover:bg-white/10"
    >
      <img
        src="https://www.google.com/favicon.ico"
        alt="google"
        className="h-5 w-5"
      />
      Continue with Google
    </button>
  );
}

function LoginForm({ navigate }) {
  const { login, loading } = useAuthStore();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await login(form.email, form.password);

      toast.success("Login successful");

      if (res.user.role === "admin" || res.user.role === "authority") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <h2 className="mb-6 text-3xl font-black">Welcome Back</h2>

      <GoogleButton />

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm text-slate-400">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Input
        icon={Mail}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <Input
        icon={Lock}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <button
        onClick={submit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950 transition hover:scale-[1.02]"
      >
        {loading && <Loader2 className="animate-spin" />}
        Login
      </button>
    </motion.div>
  );
}

function RegisterForm({ navigate }) {
  const { register, loading } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
  });

  const submit = async () => {
    try {
      const res = await register(form);

      toast.success("Account created");

      if (res.user.role === "admin" || res.user.role === "authority") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <h2 className="mb-6 text-3xl font-black">Create Account</h2>

      <GoogleButton />

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm text-slate-400">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <Input
        icon={User}
        placeholder="Full Name"
        value={form.name}
        onChange={(e) =>
          setForm({
            ...form,
            name: e.target.value,
          })
        }
      />

      <Input
        icon={Mail}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
      />

      <Input
        icon={Lock}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({
            ...form,
            password: e.target.value,
          })
        }
      />

      <select
        value={form.role}
        onChange={(e) =>
          setForm({
            ...form,
            role: e.target.value,
          })
        }
        className="glass mb-5 w-full rounded-2xl px-4 py-4 text-white outline-none"
      >
        <option value="citizen" className="bg-slate-900">
          Citizen
        </option>

        <option value="authority" className="bg-slate-900">
          Official / Authority
        </option>
      </select>

      <button
        onClick={submit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 font-bold text-slate-950 transition hover:scale-[1.02]"
      >
        {loading && <Loader2 className="animate-spin" />}
        Register
      </button>
    </motion.div>
  );
}