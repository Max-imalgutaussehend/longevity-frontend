import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { PageTitle } from '../components/ui.js';
import type { Source, ScoreResult } from '../api/types.js';
import { VERIFIED_ADAPTERS, type Token } from './freigabe/freigabeTypes.js';
import { DataSourcesStoredCard } from './freigabe/DataSourcesStoredCard.js';
import { TokenListCard } from './freigabe/TokenListCard.js';
import { CreateTokenModal } from './freigabe/CreateTokenModal.js';
import { DeleteAccountModal } from './freigabe/DeleteAccountModal.js';

// Re-export VERIFIED_ADAPTERS for tests and other modules
export { VERIFIED_ADAPTERS };

/**
 * Freigabe & Data Sovereignty page orchestrator.
 * Decomposed into DataSourcesStoredCard, TokenListCard, and modals under `./freigabe/`.
 */
export function Component() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteRequested, setDeleteRequested] = useState(false);

  const { data: sources, isLoading: srcLoading } = useQuery<Source[]>({
    queryKey: ['sources'],
    queryFn: () => apiClient<Source[]>('/sources'),
  });
  const { data: tokens, isLoading: tokLoading } = useQuery<Token[]>({
    queryKey: ['share-tokens'],
    queryFn: () => apiClient<Token[]>('/share-tokens'),
  });
  const { data: score } = useQuery<ScoreResult>({
    queryKey: ['score', 'current'],
    queryFn: () => apiClient<ScoreResult>('/score/current'),
  });

  const hasVerifiedSources = Boolean(
    sources?.some((s) => (VERIFIED_ADAPTERS as readonly string[]).includes(s.adapter) && s.enabled && s.sampleCount > 0)
  );

  const createMut = useMutation({
    mutationFn: ({ days, verifiedOnly }: { days: 30 | 90 | 180; verifiedOnly: boolean }) =>
      apiClient('/share-tokens', {
        method: 'POST',
        body: JSON.stringify({ days, verifiedOnly }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['share-tokens'] });
      setShowCreate(false);
      setCreateError(null);
    },
    onError: (err: Error) => {
      setCreateError(err.message || 'Fehler beim Erstellen des Nachweises.');
    },
  });

  const revokeMut = useMutation({
    mutationFn: (id: string) => apiClient(`/share-tokens/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['share-tokens'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (password: string) =>
      apiClient('/account/delete-request', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),
    onSuccess: () => {
      setDeleteRequested(true);
      setDeleteError(null);
    },
    onError: (err: Error) => {
      setDeleteError(err.message || 'Passwort ungültig oder Fehler bei der Anfrage.');
    },
  });

  const exportMut = useMutation({
    mutationFn: async () => {
      const data = await apiClient<unknown>('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `longevity-export-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <PageTitle title="Datenhoheit & Freigabe" />

      <DataSourcesStoredCard
        sources={sources}
        isLoading={srcLoading}
        isExporting={exportMut.isPending}
        isExportError={exportMut.isError}
        onExport={() => exportMut.mutate()}
        onRequestDeleteAccount={() => setShowDelete(true)}
      />

      <TokenListCard
        tokens={tokens}
        isLoading={tokLoading}
        onOpenCreate={() => {
          setCreateError(null);
          setShowCreate(true);
        }}
        onRevoke={(id) => revokeMut.mutate(id)}
      />

      <CreateTokenModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        sources={sources}
        score={score}
        hasVerifiedSources={hasVerifiedSources}
        isPending={createMut.isPending}
        createError={createError}
        onCreate={(days, verifiedOnly) => createMut.mutate({ days, verifiedOnly })}
      />

      <DeleteAccountModal
        isOpen={showDelete}
        onClose={() => {
          setShowDelete(false);
          setDeleteRequested(false);
          setDeleteError(null);
        }}
        isPending={deleteMut.isPending}
        deleteRequested={deleteRequested}
        deleteError={deleteError}
        onConfirmDelete={(pwd) => deleteMut.mutate(pwd)}
      />
    </div>
  );
}

export { Component as Freigabe };
export default Component;
