// ─── GraphSkeleton ──────────────────────────────────────────────────────────
// Shown inside the canvas portal while the extensions list is loading.
// Mirrors the real graph layout (site node → extension nodes) with pulsing
// placeholder content so the UI feels structured rather than blank.

const SITE_W = 170
const SITE_H = 90
const EXT_W  = 180
const EXT_H  = 88
const H_GAP  = 60   // horizontal gap between sibling extension nodes
const V_GAP  = 60   // vertical gap between the two tiers
const N_EXT  = 3    // number of skeleton extension nodes to show

export function GraphSkeleton() {
  const totalExtW = N_EXT * EXT_W + (N_EXT - 1) * H_GAP
  const canvasW   = Math.max(totalExtW, SITE_W)
  const canvasH   = SITE_H + V_GAP + EXT_H
  const siteCX    = canvasW / 2
  const siteX     = siteCX - SITE_W / 2
  const extY      = SITE_H + V_GAP
  const startX    = siteCX - totalExtW / 2

  const exts = Array.from({ length: N_EXT }, (_, i) => ({
    x:  startX + i * (EXT_W + H_GAP),
    cx: startX + i * (EXT_W + H_GAP) + EXT_W / 2,
  }))

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', width: canvasW, height: canvasH }}>

        {/* ── Edges (SVG) ──────────────────────────────────────────── */}
        <svg
          width={canvasW}
          height={canvasH}
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          {exts.map((ext, i) => (
            <line
              key={i}
              x1={siteCX}
              y1={SITE_H}
              x2={ext.cx}
              y2={extY}
              stroke="#3f3f46"
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* ── Site node ────────────────────────────────────────────── */}
        <div
          style={{ position: 'absolute', left: siteX, top: 0, width: SITE_W, height: SITE_H }}
          className="rounded-xl bg-neutral-800 border border-neutral-700 px-4 pt-3 pb-3 flex flex-col items-center gap-3"
        >
          {/* "Site" label */}
          <div className="h-2.5 w-8 rounded bg-neutral-700 animate-pulse" />
          {/* "Create Extension" button */}
          <div className="h-8 w-full rounded-lg bg-neutral-700 animate-pulse" />
        </div>

        {/* ── Extension nodes ──────────────────────────────────────── */}
        {exts.map((ext, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: ext.x, top: extY, width: EXT_W, height: EXT_H }}
            className="rounded-xl bg-neutral-800 border border-neutral-700 px-3 pt-3 pb-3 flex flex-col gap-2.5"
          >
            {/* Title */}
            <div className="h-3 w-3/4 rounded bg-neutral-700 animate-pulse" />
            {/* Key (monospace, narrower) */}
            <div className="h-2 w-1/2 rounded bg-neutral-700/70 animate-pulse" />
            {/* Edit / Delete buttons */}
            <div className="flex gap-1.5">
              <div className="h-6 w-12 rounded-md bg-neutral-700 animate-pulse" />
              <div className="h-6 w-14 rounded-md bg-neutral-700 animate-pulse" />
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
