import { createContext } from 'react'
import { type RecordsCtxValue } from './types'

export const RecordsCtx = createContext<RecordsCtxValue>({
  status: 'idle',
  count: 0,
  onRefresh: () => {},
})
