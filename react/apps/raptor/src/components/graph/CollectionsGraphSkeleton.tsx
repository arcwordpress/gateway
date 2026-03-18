// ─── CollectionsGraphSkeleton ───────────────────────────────────────────────
// Shown while the extensions / collections queries are loading.
// Mirrors the real collections graph hierarchy:
//   Extension → Collections Group → Collections
// Node sizes and gaps are taken from layoutWithDagre NODE_DIMS
// (nodesep: 80, ranksep: 60).

const EXT_W = 160, EXT_H = 95
const GRP_W = 110, GRP_H = 68
const COL_W = 180, COL_H = 70
const N_COLS = 2
const H_COL_GAP = 80   // nodesep between sibling collection nodes
const V_GAP = 60        // ranksep between tiers

// ── Pre-computed layout ──────────────────────────────────────────────────────

const totalColsW = N_COLS * COL_W + (N_COLS - 1) * H_COL_GAP   // 440
const canvasW    = totalColsW                                     // 440
const cx         = canvasW / 2                                    // 220

// Tier 0 – Extension node
const extX  = cx - EXT_W / 2      // 140
const extY  = 0
const extCX = cx                   // 220
const extBY = EXT_H                // 95

// Tier 1 – Collections Group node
const grpX  = cx - GRP_W / 2      // 165
const grpY  = extBY + V_GAP       // 155
const grpCX = cx                   // 220
const grpBY = grpY + GRP_H        // 223

// Tier 2 – Collection nodes
const colSpan = COL_W / 2 + H_COL_GAP / 2 + COL_W / 2   // 260 (center-to-center)
const colY    = grpBY + V_GAP                               // 283

const cols = Array.from({ length: N_COLS }, (_, i) => {
  const colCX = cx + (i - (N_COLS - 1) / 2) * colSpan
  return { x: colCX - COL_W / 2, cx: colCX }
})

const canvasH = colY + COL_H   // 353

export function CollectionsGraphSkeleton() {
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
          {/* Extension → CollectionsGroup */}
          <line x1={extCX} y1={extBY} x2={grpCX} y2={grpY} stroke="#3f3f46" strokeWidth={1.5} />

          {/* CollectionsGroup → each Collection */}
          {cols.map((col, i) => (
            <line
              key={i}
              x1={grpCX}
              y1={grpBY}
              x2={col.cx}
              y2={colY}
              stroke="#3f3f46"
              strokeWidth={1.5}
            />
          ))}
        </svg>

        {/* ── Extension node ───────────────────────────────────────── */}
        <div
          style={{ position: 'absolute', left: extX, top: extY, width: EXT_W, height: EXT_H }}
          className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 pt-2.5 pb-2.5 flex flex-col gap-2"
        >
          {/* Type label */}
          <div className="h-2 w-14 rounded bg-neutral-700 animate-pulse self-end" />
          {/* Title */}
          <div className="h-3 w-3/4 rounded bg-neutral-700 animate-pulse" />
          {/* Description */}
          <div className="h-2 w-1/2 rounded bg-neutral-700/60 animate-pulse" />
          {/* Status chip */}
          <div className="h-5 w-12 rounded-full bg-neutral-700/50 animate-pulse mt-auto" />
        </div>

        {/* ── Collections Group node ───────────────────────────────── */}
        <div
          style={{ position: 'absolute', left: grpX, top: grpY, width: GRP_W, height: GRP_H }}
          className="rounded-lg bg-neutral-800/70 border border-neutral-700/60 flex flex-col"
        >
          {/* Toggle row */}
          <div className="flex items-center justify-center gap-1.5 px-3 py-2">
            <div className="h-2 w-2 rounded bg-neutral-700 animate-pulse" />
            <div className="h-2 w-16 rounded bg-neutral-700 animate-pulse" />
          </div>
          {/* Create button row */}
          <div className="border-t border-neutral-700/60 px-3 py-1.5">
            <div className="h-2 w-20 rounded bg-neutral-700/50 animate-pulse mx-auto" />
          </div>
        </div>

        {/* ── Collection nodes ─────────────────────────────────────── */}
        {cols.map((col, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: col.x, top: colY, width: COL_W, height: COL_H }}
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 pt-2 pb-2.5 flex flex-col gap-1.5"
          >
            {/* "Collection" label */}
            <div className="h-1.5 w-12 rounded bg-neutral-700/50 animate-pulse self-end" />
            {/* Title */}
            <div className="h-3 w-3/4 rounded bg-neutral-700 animate-pulse" />
            {/* Key */}
            <div className="h-2 w-1/2 rounded bg-neutral-700/60 animate-pulse" />
            {/* Edit / Delete buttons */}
            <div className="flex gap-1 mt-auto pt-1.5 border-t border-neutral-700/40">
              <div className="h-5 flex-1 rounded bg-neutral-700 animate-pulse" />
              <div className="h-5 flex-1 rounded bg-neutral-700 animate-pulse" />
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
