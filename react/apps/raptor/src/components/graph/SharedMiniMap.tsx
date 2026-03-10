import { MiniMap, type MiniMapProps } from '@xyflow/react'

type SharedMiniMapProps = Omit<MiniMapProps, 'style'> & {
  style?: React.CSSProperties
}

const defaultStyle: React.CSSProperties = {
  marginBottom: 10,
  marginRight: 16,
}

export function SharedMiniMap({ style, ...props }: SharedMiniMapProps) {
  return (
    <MiniMap
      position="bottom-right"
      bgColor="#444"
      nodeColor="#999"
      nodeStrokeColor="#666"
      nodeStrokeWidth={1}
      maskColor="rgba(0, 0, 0, 0.28)"
      maskStrokeColor="#666"
      zoomable
      pannable
      style={{ ...defaultStyle, ...style }}
      {...props}
    />
  )
}
