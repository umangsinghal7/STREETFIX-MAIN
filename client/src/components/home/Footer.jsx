import { MapPinned } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/15">
            <MapPinned className="h-6 w-6 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              Street<span className="text-cyan-300">Fix</span>
            </h3>
            <p className="text-sm text-slate-400">Civic Transparency Platform</p>
          </div>
        </div>

        <div className="flex gap-6 text-sm text-slate-400">
          <a href="#">About</a>
          <a href="#">Map</a>
          <a href="#">Leaderboard</a>
          <a href="#">Contact</a>
        </div>

        <p className="text-sm text-slate-500">© 2026 StreetFix</p>
      </div>
    </footer>
  );
}
