// import { create } from "zustand";
// import api from "../lib/axios";

// const useAuthStore = create((set, get) => ({
//   user: null,
//   token: localStorage.getItem("token") || null,
//   loading: false,

//   setToken: (token) => {
//     if (token) localStorage.setItem("token", token);
//     else localStorage.removeItem("token");
//     set({ token });
//   },

//   fetchUser: async () => {
//     try {
//       const token = get().token || localStorage.getItem("token");
//       if (!token) return null;
//       const res = await api.get("/api/auth/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       set({ user: res.data, token });
//       return res.data;
//     } catch {
//       localStorage.removeItem("token");
//       set({ user: null, token: null });
//       return null;
//     }
//   },

//   login: async (email, password) => {
//     set({ loading: true });
//     try {
//       const res = await api.post("/api/auth/login", { email, password });
//       localStorage.setItem("token", res.data.token);
//       set({ token: res.data.token, user: res.data.user, loading: false });
//       return res.data;
//     } catch (err) {
//       set({ loading: false });
//       throw err;
//     }
//   },

//   register: async (payload) => {
//     set({ loading: true });
//     try {
//       const res = await api.post("/api/auth/register", payload);
//       localStorage.setItem("token", res.data.token);
//       set({ token: res.data.token, user: res.data.user, loading: false });
//       return res.data;
//     } catch (err) {
//       set({ loading: false });
//       throw err;
//     }
//   },

//   logout: () => {
//     localStorage.removeItem("token");
//     set({ user: null, token: null });
//   },
// }));

// export default useAuthStore;
import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://streetfix-main.onrender.com";

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  setUser: (user) => {
    set({ user });
  },

  register: async (formData) => {
    set({ loading: true });

    try {
      const res = await axios.post(`${API}/api/auth/register`, formData);

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return res.data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      set({
        user: res.data.user,
        token: res.data.token,
        loading: false,
      });

      return res.data;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchUser: async () => {
    const token = get().token;

    if (!token) return;

    try {
      const res = await axios.get(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set({
        user: res.data,
      });
    } catch {
      localStorage.removeItem("token");

      set({
        user: null,
        token: null,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("token");

    set({
      user: null,
      token: null,
    });
  },
}));

export default useAuthStore;