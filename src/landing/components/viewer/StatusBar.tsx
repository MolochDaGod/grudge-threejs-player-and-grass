import { useCharacterStore } from "../../hooks/useCharacterStore";

function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  accent = "accent-amber-400",
  displayValue,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: string;
  displayValue?: string;
}) {
  return (
    <label className="flex items-center gap-1.5 select-none cursor-pointer">
      <span className="text-slate-400 shrink-0 text-[11px]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-24 h-1 rounded cursor-pointer ${accent}`}
      />
      <span className="text-slate-300 text-[11px] w-7 text-right tabular-nums shrink-0">
        {displayValue ?? value}
      </span>
    </label>
  );
}

function fmtTime(progress: number, duration: number | null): string {
  if (!duration) return "0:00";
  const secs = (progress / 100) * duration;
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(1).padStart(4, "0");
  return `${m}:${s}`;
}

export function StatusBar() {
  const {
    isLoading,
    loadError,
    currentAnim,
    activeWeapon,
    selectedRace,
    animOverdrive,
    setAnimOverdrive,
    animArmSpace,
    setAnimArmSpace,
    animTrimStart,
    animTrimEnd,
    setAnimTrim,
    animMirror,
    setAnimMirror,
    animFrameCount,
    animPaused,
    setAnimPaused,
    animProgress,
    setAnimProgress,
    setAnimScrubTo,
    clipMeta,
  } = useCharacterStore();

  const isCrossRace =
    currentAnim.raceSpecific === true &&
    currentAnim.sourceRace != null &&
    currentAnim.sourceRace !== selectedRace.abbr;

  const totalFrames = animFrameCount > 0 ? animFrameCount : null;
  const clipDuration = clipMeta.get(currentAnim.file)?.duration ?? null;

  const overdriveLabel =
    animOverdrive === 50 ? "1×" : `${(animOverdrive / 50).toFixed(2)}×`;

  function handleStop() {
    setAnimPaused(true);
    setAnimScrubTo(animTrimStart);
    setAnimProgress(animTrimStart);
  }

  function handleScrub(val: number) {
    setAnimProgress(val);
    setAnimScrubTo(val);
  }

  return (
    <div className="flex flex-col bg-slate-900/95 border-t border-slate-700/50 text-xs select-none">

      {/* ── Row 1: status + anim info ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-1 flex-wrap">
        {isLoading && (
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Loading...
          </span>
        )}
        {!isLoading && !loadError && (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            Ready
          </span>
        )}
        {loadError && (
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
            {loadError}
          </span>
        )}

        <span className="text-slate-600">|</span>
        <span className="text-slate-400">
          Anim: <span className="text-slate-200 font-medium">{currentAnim.name}</span>
        </span>

        {isCrossRace && (
          <>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1 text-violet-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />
              retargeted from {currentAnim.sourceRace}
            </span>
          </>
        )}
        {currentAnim.raceSpecific && currentAnim.sourceRace && !isCrossRace && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Source: <span className="text-slate-200">{currentAnim.sourceRace}</span>
            </span>
          </>
        )}
        {!currentAnim.raceSpecific && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Pack: <span className="text-slate-200">{currentAnim.pack}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              Weapon:{" "}
              <span className="text-slate-200 capitalize">
                {activeWeapon.replace("_", " ")}
              </span>
            </span>
          </>
        )}
        {currentAnim.raceSpecific && currentAnim.file && (
          <>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 truncate max-w-[200px]" title={currentAnim.file}>
              {currentAnim.file}
            </span>
          </>
        )}
      </div>

      {/* ── Row 2: transport + scrub timeline ─────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-slate-800">
        {/* Stop */}
        <button
          onClick={handleStop}
          title="Stop — reset to start"
          className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
        >
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-current">
            <rect x="1" y="1" width="8" height="8" />
          </svg>
        </button>

        {/* Play / Pause / Replay */}
        {(() => {
          const isFinished = animPaused && animProgress >= 99;
          const label = isFinished ? "Replay" : animPaused ? "Play" : "Pause";
          return (
            <button
              onClick={() => setAnimPaused(!animPaused)}
              title={label}
              className={`h-6 px-2 flex items-center gap-1.5 rounded transition-colors shrink-0 text-[11px] font-medium ${
                animPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              {isFinished ? (
                /* replay — circle arrow icon */
                <svg viewBox="0 0 10 10" className="w-3 h-3 fill-current">
                  <polygon points="1,3 5,1 5,5" />
                  <path d="M5 1.5 A3.5 3.5 0 1 1 1.5 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              ) : animPaused ? (
                /* play triangle */
                <svg viewBox="0 0 10 10" className="w-3 h-3 fill-current">
                  <polygon points="2,1 9,5 2,9" />
                </svg>
              ) : (
                /* pause bars */
                <svg viewBox="0 0 10 10" className="w-3 h-3 fill-current">
                  <rect x="1.5" y="1" width="2.5" height="8" />
                  <rect x="6" y="1" width="2.5" height="8" />
                </svg>
              )}
              <span>{label}</span>
            </button>
          );
        })()}

        {/* Current time */}
        <span className="text-slate-500 text-[11px] tabular-nums w-10 text-right shrink-0">
          {fmtTime(animProgress, clipDuration)}
        </span>

        {/* Scrub bar */}
        <input
          type="range"
          min={animTrimStart}
          max={animTrimEnd}
          step={1}
          value={animProgress}
          onChange={(e) => handleScrub(Number(e.target.value))}
          className="flex-1 h-1 rounded cursor-pointer accent-emerald-400 min-w-0"
        />

        {/* End time */}
        <span className="text-slate-500 text-[11px] tabular-nums w-10 shrink-0">
          {clipDuration
            ? `${clipDuration.toFixed(1)}s`
            : totalFrames
            ? `${totalFrames}f`
            : "--"}
        </span>

        {/* Plays-once badge */}
        <span
          title="Plays once — press Play / Replay to run again"
          className="text-[11px] text-slate-500 shrink-0 tabular-nums"
        >
          ×1
        </span>
      </div>

      {/* ── Row 3: Mixamo-style modifier controls ─────────────────────────── */}
      <div className="flex items-center gap-4 px-3 py-1.5 border-t border-slate-800 flex-wrap">
        <Slider
          label="Overdrive"
          value={animOverdrive}
          onChange={setAnimOverdrive}
          accent="accent-amber-400"
          displayValue={overdriveLabel}
        />

        <Slider
          label="Arm-Space"
          value={animArmSpace}
          onChange={setAnimArmSpace}
          accent="accent-sky-400"
        />

        <span className="text-slate-700">|</span>

        {/* Trim — two constrained sliders */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] shrink-0">
            Trim
            {totalFrames !== null && (
              <span className="text-slate-600 ml-1">({totalFrames} frames)</span>
            )}
          </span>
          <span className="text-slate-500 text-[11px]">In</span>
          <input
            type="range"
            min={0}
            max={animTrimEnd - 1}
            step={1}
            value={animTrimStart}
            onChange={(e) => setAnimTrim(Number(e.target.value), animTrimEnd)}
            className="w-20 h-1 rounded cursor-pointer accent-rose-400"
          />
          <span className="text-slate-300 text-[11px] tabular-nums w-6 text-right">
            {totalFrames ? Math.round((animTrimStart / 100) * totalFrames) : animTrimStart}
          </span>

          <span className="text-slate-500 text-[11px]">Out</span>
          <input
            type="range"
            min={animTrimStart + 1}
            max={100}
            step={1}
            value={animTrimEnd}
            onChange={(e) => setAnimTrim(animTrimStart, Number(e.target.value))}
            className="w-20 h-1 rounded cursor-pointer accent-rose-400"
          />
          <span className="text-slate-300 text-[11px] tabular-nums w-6 text-right">
            {totalFrames ? Math.round((animTrimEnd / 100) * totalFrames) : animTrimEnd}
          </span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Mirror */}
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={animMirror}
            onChange={(e) => setAnimMirror(e.target.checked)}
            className="w-3.5 h-3.5 accent-violet-400 cursor-pointer"
          />
          <span className={`text-[11px] ${animMirror ? "text-violet-300" : "text-slate-400"}`}>
            Mirror
          </span>
        </label>
      </div>
    </div>
  );
}
