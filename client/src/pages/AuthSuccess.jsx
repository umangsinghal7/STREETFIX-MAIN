import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function AuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      navigate("/auth");
      return;
    }

    localStorage.setItem("token", token);
    setToken(token);

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        setUser(user);

        if (user.role === "admin" || user.role === "authority") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      })
      .catch(() => navigate("/auth"));
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-white text-2xl font-bold">
      Signing you in...
    </div>
  );
}