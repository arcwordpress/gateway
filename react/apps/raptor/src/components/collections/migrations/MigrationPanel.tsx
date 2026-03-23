import React, { useState } from 'react';
import PanelShell from '../../ui/PanelShell';
import { MigrationPanelState } from '../../../types/MigrationPanelState';
import { apiUrl, authHeaders } from '../../../lib/api';
import InstallSuccess from './InstallSuccess';

interface MigrationPanelProps {
  state: MigrationPanelState;
  onClose: () => void;
  onStateChange: (s: MigrationPanelState) => void;
}

const MigrationPanel: React.FC<MigrationPanelProps> = ({ state, onClose, onStateChange }) => {
  const [copied, setCopied] = useState(false);
  const [runResult, setRunResult] = useState<{ success: boolean; message: string } | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-999999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      alert('Failed to copy to clipboard');
    }
  };

  const installMigration = async (extensionKey: string) => {
    onStateChange({ ...state, installing: true, installSuccess: null });
    try {
      const res = await fetch(
        apiUrl(`gateway/v1/migrations/${state.collectionKey}/install`),
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ extension: extensionKey }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to install migration');
      onStateChange({
        ...state,
        installing: false,
        installSuccess: { message: data.message, filePath: data.filePath },
      });
    } catch (err) {
      alert('Error installing migration: ' + (err as Error).message);
      onStateChange({ ...state, installing: false });
    }
  };

  const runMigration = async () => {
    setRunResult(null);
    onStateChange({ ...state, runningMigration: true });
    try {
      const res = await fetch(
        apiUrl(`gateway/v1/migrations/${state.collectionKey}/run`),
        { method: 'POST', headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to run migration');
      setRunResult({ success: true, message: data.message ?? 'Migration executed successfully!' });
      onStateChange({ ...state, runningMigration: false });
    } catch (err) {
      setRunResult({ success: false, message: 'Error: ' + (err as Error).message });
      onStateChange({ ...state, runningMigration: false });
    }
  };

  return (
    <PanelShell title="Database Migration" sub={state.collectionKey} onClose={onClose} width={480}>
        {state.loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-500 text-sm">Generating migration code…</p>
          </div>
        ) : state.migration ? (
          <div className="space-y-4">
            {/* Install success */}
            {state.installSuccess && (
              <InstallSuccess state={state} />
            )}

            {/* Install to extension */}
            {state.extensions.length > 0 && !state.installSuccess && (
              <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/30">
                <p className="text-zinc-300 text-xs font-semibold mb-2">Install to Extension</p>
                <div className="space-y-1.5">
                  {state.extensions.map((ext) => (
                    <div
                      key={ext.key}
                      className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800/50"
                    >
                      <div>
                        <div className="text-zinc-200 text-xs font-medium">{ext.slug}</div>
                        <code className="text-[10px] text-zinc-500 font-mono">{ext.databasePath}</code>
                      </div>
                      <button
                        onClick={() => void installMigration(ext.key)}
                        disabled={state.installing}
                        className="px-2.5 py-1 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {state.installing ? 'Installing…' : 'Install'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual instructions */}
            {!state.installSuccess && (
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-700/40">
                <p className="text-zinc-300 text-xs font-semibold mb-1.5">Manual Installation</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-400">
                  <li>
                    Save to{' '}
                    <code className="text-zinc-300 bg-zinc-800/60 px-1 rounded">
                      /lib/Database/{state.migration.className}.php
                    </code>
                  </li>
                  <li>Require the file in your plugin</li>
                  <li>
                    Call{' '}
                    <code className="text-zinc-300 bg-zinc-800/60 px-1 rounded">
                      {state.migration.className}::create()
                    </code>{' '}
                    from your activation hook
                  </li>
                </ol>
              </div>
            )}

            {/* Notes */}
            {state.migration.notes.length > 0 && (
              <div className="p-3 rounded-lg bg-zinc-900/20 border border-zinc-800/30">
                <p className="text-zinc-200 text-xs font-semibold mb-1">Notes</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {state.migration.notes.map((note, i) => (
                    <li key={i} className="text-zinc-300 text-xs">{note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Code */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-zinc-300 text-xs font-semibold">Generated Code</span>
                <button
                  onClick={() => void copyToClipboard(state.migration!.code)}
                  className="px-2.5 py-0.5 text-xs rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed max-h-64 overflow-y-auto">
                <code>{state.migration.code}</code>
              </pre>
            </div>

            {/* Run result */}
            {runResult && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: runResult.success ? '#18181b' : '#18181b',
                  border: `1px solid ${runResult.success ? '#3f3f46' : '#52525b'}`,
                  fontSize: 12,
                  color: runResult.success ? '#a1a1aa' : '#e4e4e7',
                }}
              >
                {runResult.message}
              </div>
            )}

            {/* Run button */}
            <button
              onClick={() => void runMigration()}
              disabled={state.runningMigration}
              className="w-full px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-medium transition-colors"
            >
              {state.runningMigration ? 'Running Migration…' : runResult?.success ? 'Run Again' : 'Run Migration Now'}
            </button>
          </div>
        ) : null}
      </PanelShell>
    )
  }

export default MigrationPanel;
