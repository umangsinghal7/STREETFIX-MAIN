import { useState, useRef } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import {
  UploadCloud,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  Brain,
} from "lucide-react";

export default function ReportIssueModal({
  open,
  onClose,
  position,
  refresh,
}) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [preview, setPreview] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceField, setVoiceField] = useState(null);
  const recognitionRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "pothole",
    severity: "medium",
    ward: "Ward 1 - Koramangala",
  });

  if (!open) return null;

  /* ================= AI IMAGE DETECTION ================= */

  const handleImageUpload = async (file) => {
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setAiLoading(true);
    setAiResult(null);

    try {
      const fd = new FormData();
      fd.append("image", file);

      const res = await api.post("/api/ai/detect", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAiResult(res.data);

      setForm((prev) => ({
        ...prev,
        category: res.data.category || prev.category,
        severity: res.data.severity || prev.severity,
      }));

      toast.success(
        `AI detected ${res.data.category} (${res.data.confidence}%)`
      );
    } catch {
      toast.error("AI detection failed");
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= VOICE ================= */

  const startVoiceInput = (field) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceField(field);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setForm((prev) => ({
        ...prev,
        [field]: transcript,
      }));
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceField(null);
    };

    recognition.start();
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setVoiceField(null);
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/reports", {
        title: form.title,
        description: form.description,
        category: form.category,
        severity: form.severity,
        ward: form.ward,

        location: {
          type: "Point",
          coordinates: [
            position?.lng || 77.209,
            position?.lat || 28.6139,
          ],
          address: "Pinned on map",
        },

        beforeImage: preview || "",
      });

      toast.success("Issue reported successfully");

      setForm({
        title: "",
        description: "",
        category: "pothole",
        severity: "medium",
        ward: "Ward 1 - Koramangala",
      });

      setPreview("");
      setAiResult(null);

      refresh();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6">
      <div className="glass max-h-[90vh] w-full max-w-2xl overflow-auto rounded-[34px] p-8 text-white">
        <h2 className="mb-6 text-3xl font-black">
          Report Civic Issue
        </h2>

        {/* upload */}
        <label className="mb-5 flex h-48 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-cyan-300/20 bg-white/5 hover:border-cyan-300/50">
          {aiLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Brain
                size={40}
                className="animate-pulse text-cyan-300"
              />
              <p>AI analyzing...</p>
            </div>
          ) : preview ? (
            <img
              src={preview}
              className="h-full w-full rounded-[28px] object-cover"
            />
          ) : (
            <>
              <UploadCloud
                size={40}
                className="text-cyan-300"
              />
              <p className="mt-3 text-slate-400">
                Upload image
              </p>
            </>
          )}

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImageUpload(e.target.files[0])
            }
          />
        </label>

        {/* ai result */}
        {aiResult && (
          <div className="mb-5 rounded-[28px] bg-cyan-500/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-cyan-300 font-bold">
              <Sparkles size={18} />
              AI Detection ({aiResult.confidence}%)
            </div>

            <p className="capitalize">
              {aiResult.category} • {aiResult.severity}
            </p>
          </div>
        )}

        {/* title */}
        <div className="relative mb-4">
          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            placeholder="Issue title"
            className="w-full rounded-2xl bg-white/5 p-4 pr-14 outline-none"
          />

          <button
            onClick={() =>
              isListening && voiceField === "title"
                ? stopVoiceInput()
                : startVoiceInput("title")
            }
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {isListening &&
            voiceField === "title" ? (
              <MicOff />
            ) : (
              <Mic />
            )}
          </button>
        </div>

        {/* description */}
        <div className="relative mb-4">
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            placeholder="Describe issue"
            className="w-full rounded-2xl bg-white/5 p-4 pr-14 outline-none"
          />

          <button
            onClick={() =>
              isListening &&
              voiceField === "description"
                ? stopVoiceInput()
                : startVoiceInput("description")
            }
            className="absolute right-3 top-4"
          >
            {isListening &&
            voiceField === "description" ? (
              <MicOff />
            ) : (
              <Mic />
            )}
          </button>
        </div>

        {/* dropdowns */}
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="rounded-2xl bg-slate-900 p-4"
          >
            <option value="pothole">Pothole</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
            <option value="water_leak">Water Leak</option>
            <option value="road_damage">Road Damage</option>
            <option value="drainage">Drainage</option>
            <option value="other">Other</option>
          </select>

          <select
            value={form.severity}
            onChange={(e) =>
              setForm({
                ...form,
                severity: e.target.value,
              })
            }
            className="rounded-2xl bg-slate-900 p-4"
          >
            <option value="low">Low 🟡</option>
            <option value="medium">Medium 🟠</option>
            <option value="high">High 🔴</option>
          </select>

          <select
            value={form.ward}
            onChange={(e) =>
              setForm({
                ...form,
                ward: e.target.value,
              })
            }
            className="rounded-2xl bg-slate-900 p-4"
          >
            <option>Ward 1 - Koramangala</option>
            <option>Ward 2 - Indiranagar</option>
            <option>Ward 3 - HSR Layout</option>
            <option>Ward 4 - Whitefield</option>
          </select>
        </div>

        {/* buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-white/5 py-4"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-4 font-bold text-black"
          >
            {loading && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}