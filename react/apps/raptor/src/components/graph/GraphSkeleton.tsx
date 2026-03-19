// ─── GraphSkeleton ──────────────────────────────────────────────────────────
// Single generic skeleton used across all graph routes while data is loading.
// Renders a centred 2-tier tree of pulsing placeholder nodes with SVG edges.

const ROOT_W = 200, ROOT_H = 64
const CHILD_W = 160, CHILD_H = 64
const H_GAP   = 60   // horizontal gap between sibling nodes
const V_GAP   = 60   // vertical gap between tiers
const N       = 3    // number of child nodes

const totalChildW = N * CHILD_W + (N - 1) * H_GAP   // 600
const canvasW     = totalChildW                       // 600
const cx          = canvasW / 2                       // 300

const rootX  = cx - ROOT_W / 2                        // 200
const rootBY = ROOT_H                                 // 64
const childY = ROOT_H + V_GAP                         // 124

const children = Array.from({ length: N }, (_, i) => {
  const childCX = (i - (N - 1) / 2) * (CHILD_W + H_GAP) + cx
  return { x: childCX - CHILD_W / 2, cx: childCX }
})

const canvasH = childY + CHILD_H   // 188

export function GraphSkeleton() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div style={{ position: 'relative', width: canvasW, height: canvasH }}>

        {/* ── Edges ────────────────────────────────────────────────── */}
        <svg
          width={canvasW}
          height={canvasH}
          className="absolute inset-0 overflow-visible"
        >
          {children.map((c, i) => (
            <line
              key={i}
              x1={cx}   y1={rootBY}
              x2={c.cx} y2={childY}
              className="stroke-zinc-700"
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* ── Root node ────────────────────────────────────────────── */}
        <div
          style={{ position: 'absolute', left: rootX, top: 0, width: ROOT_W, height: ROOT_H }}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 flex flex-col gap-2"
        >
          <div className="h-2.5 w-2/3 rounded bg-zinc-700 animate-pulse" />
          <div className="h-2 w-1/2 rounded bg-zinc-700/60 animate-pulse" />
        </div>

        {/* ── Child nodes ──────────────────────────────────────────── */}
        {children.map((c, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: c.x, top: childY, width: CHILD_W, height: CHILD_H }}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 flex flex-col gap-2"
          >
            <div className="h-2.5 w-3/4 rounded bg-zinc-700 animate-pulse" />
            <div className="h-2 w-1/2 rounded bg-zinc-700/60 animate-pulse" />
          </div>
        ))}

      </div>
    </div>
  )
}
