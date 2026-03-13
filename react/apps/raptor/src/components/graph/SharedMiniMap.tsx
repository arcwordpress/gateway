import { MiniMap, type MiniMapProps } from '@xyflow/react'

type SharedMiniMapProps = Omit<MiniMapProps, 'style'> & {
  style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
  marginBottom: 10,
  marginRight: 16,
  width: 154,
  height: 88,
}

export function SharedMiniMap({ style, ...props }: SharedMiniMapProps) {
  return (
    <MiniMap
      position="bottom-right"
      bgColor="#27272a"
      nodeColor="#52525b"
      nodeStrokeColor="#3f3f46"
      nodeStrokeWidth={1}
      maskColor="rgba(0, 0, 0, 0.32)"
      maskStrokeColor="#3f3f46"
      zoomable
      pannable
      style={{ ...defaultStyle, ...style }}
      {...props}
    />
  )
}
