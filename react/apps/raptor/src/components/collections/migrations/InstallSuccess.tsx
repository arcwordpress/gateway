import type { MigrationPanelState } from '../../../types/MigrationPanelState';

export default function InstallSuccess({state}: {state: MigrationPanelState}) {

    return (
        <div className="p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/40">
        <p className="text-zinc-200 text-xs font-semibold mb-1">Migration Installed Successfully!</p>
        <p className="text-zinc-300 text-xs">{state.installSuccess!.message}</p>
        <code className="text-[10px] text-zinc-500 font-mono block mt-2 bg-zinc-900/30 px-2 py-1 rounded">
            {state.installSuccess!.filePath}
        </code>
        </div>
    )
}