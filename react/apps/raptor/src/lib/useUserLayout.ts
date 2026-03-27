import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { type Node } from '@xyflow/react'
import { apiUrl, authHeaders } from './api'

export type NodePosition = { id: string; x: number; y: number }

type LayoutResponse = {
  success: boolean
  layout: { route_key: string; nodes: NodePosition[] } | null
}

/**
 * Persists and restores the React Flow node layout for a given graph route.
 *
 * @param routeKey  Slug identifying which graph view, e.g. "collections",
 *                  "collections-my_coll-forms".
 *
 * Returns:
 *   savedNodes  - Saved positions from the server, or null if no layout is
 *                 saved yet (caller should fall back to its default layout).
 *   isLoading   - True while the initial GET is in flight.
 *   saveLayout  - Call with the current ReactFlow Node array after a drag
 *                 stops. Maps each node's position and POSTs to the server.
 *   resetLayout - Deletes the saved layout so the next render uses the
 *                 default Dagre / computed positions.
 */
export function useUserLayout(routeKey: string) {
  const queryClient = useQueryClient()
  const queryKey = ['raptor-user-layout', routeKey]

  const { data, isLoading } = useQuery<LayoutResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(
        apiUrl(`gateway/v1/raptor/user-layout/${routeKey}`),
        { headers: authHeaders() },
      )
      return res.json() as Promise<LayoutResponse>
    },
    staleTime: Infinity,
  })

  const saveMutation = useMutation({
    mutationFn: async (nodes: NodePosition[]) => {
      const res = await fetch(
        apiUrl(`gateway/v1/raptor/user-layout/${routeKey}`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ nodes }),
        },
      )
      return res.json() as Promise<LayoutResponse>
    },
    onSuccess: (result) => {
      queryClient.setQueryData<LayoutResponse>(queryKey, result)
    },
  })

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        apiUrl(`gateway/v1/raptor/user-layout/${routeKey}`),
        { method: 'DELETE', headers: authHeaders() },
      )
      return res.json()
    },
    onSuccess: () => {
      queryClient.setQueryData<LayoutResponse>(queryKey, { success: true, layout: null })
    },
  })

  const saveLayout = useCallback(
    (reactFlowNodes: Node[]) => {
      const positions: NodePosition[] = reactFlowNodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
      }))
      saveMutation.mutate(positions)
    },
    [saveMutation],
  )

  const resetLayout = useCallback(() => {
    resetMutation.mutate()
  }, [resetMutation])

  return {
    savedNodes: data?.layout?.nodes ?? null,
    isLoading,
    saveLayout,
    resetLayout,
  }
}
