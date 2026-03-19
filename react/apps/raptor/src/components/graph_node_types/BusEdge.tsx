import { type EdgeProps } from '@xyflow/react'

/**
 * Bus-style orthogonal edge for extension → collection connections.
 *
 * Draws: horizontal trunk from source right handle to the collection's
 * center-x, then a vertical drop into the collection's top handle.
 *
 * When multiple edges share the same source node they all start at the
 * same sourceY, so their horizontal segments visually merge into a
 * single trunk line — the classic bus/tree diagram look.
 */
export function BusEdge({ sourceX, sourceY, targetX, targetY, style }: EdgeProps) {
  const d = `M ${sourceX},${sourceY} H ${targetX} V ${targetY}`
  return (
    <path
      d={d}
      fill="none"
      stroke="#3f3f46"
      strokeWidth={1}
      style={style}
    />
  )
}
