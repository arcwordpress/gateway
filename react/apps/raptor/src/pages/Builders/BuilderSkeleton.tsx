import { BuilderLayout } from './BuilderLayout'
import { BuilderTopBar } from './BuilderTopBar'
import { BuilderLeftPanel } from './BuilderLeftPanel'

export function BuilderSkeleton() {
  return (
    <BuilderLayout>
      <BuilderTopBar />
      <BuilderLeftPanel>
        <div className="p-6">
          <div className="mb-8">
            <div className="h-3 w-20 rounded bg-zinc-800 animate-pulse mb-2" />
            <div className="h-7 w-36 rounded bg-zinc-700 animate-pulse" />
          </div>
          <div className="flex justify-between items-center mb-10">
            <div className="h-6 w-24 rounded bg-zinc-700 animate-pulse" />
            <div className="h-8 w-8 rounded bg-zinc-800 animate-pulse" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </div>
      </BuilderLeftPanel>
    </BuilderLayout>
  )
}
