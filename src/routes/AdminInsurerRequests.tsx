import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client.js';
import { Card, PageTitle, Btn, Skeleton } from '../components/ui.js';

interface InsurerRequest {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STATUS_LABEL: Record<InsurerRequest['status'], string> = {
  pending: 'Offen',
  approved: 'Angenommen',
  rejected: 'Abgelehnt',
};

const STATUS_COLOR: Record<InsurerRequest['status'], string> = {
  pending: '#a3781f',
  approved: '#0f6e56',
  rejected: '#a32d2d',
};

export function Component() {
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery<InsurerRequest[]>({
    queryKey: ['admin-insurer-requests'],
    queryFn: () => apiClient('/admin/insurer-requests'),
  });

  const approveMut = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/insurer-requests/${id}/approve`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-insurer-requests'] }),
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/insurer-requests/${id}/reject`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-insurer-requests'] }),
  });

  const resendMut = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/insurer-requests/${id}/resend-invite`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-insurer-requests'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/insurer-requests/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['admin-insurer-requests'] });
      setOpenId((current) => (current === id ? null : current));
    },
  });

  const pending = (requests ?? []).filter((r) => r.status === 'pending');
  const decided = (requests ?? []).filter((r) => r.status !== 'pending');

  return (
    <div>
      <PageTitle title="Krankenkassen-Anfragen" sub="Erstkontakt-Anfragen prüfen und Zugang freigeben" />

      {isLoading ? (
        <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
              Offen ({pending.length})
            </div>
            {pending.length === 0 ? (
              <Card style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#888780', margin: 0 }}>Keine offenen Anfragen.</p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {pending.map((r) => (
                  <Card key={r.id} style={{ padding: 20 }} data-testid={`insurer-request-${r.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#22221f' }}>{r.company}</div>
                        <div style={{ fontSize: 13, color: '#55544f', marginTop: 4 }}>{r.contactName} · {r.contactEmail}</div>
                        {r.message && <div style={{ fontSize: 12, color: '#888780', marginTop: 8, maxWidth: 480 }}>{r.message}</div>}
                        <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 8 }}>
                          {new Date(r.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <Btn
                          small
                          variant="danger"
                          onClick={() => rejectMut.mutate(r.id)}
                          disabled={approveMut.isPending || rejectMut.isPending}
                          testId={`insurer-request-reject-${r.id}`}
                        >
                          Ablehnen
                        </Btn>
                        <Btn
                          small
                          onClick={() => approveMut.mutate(r.id)}
                          disabled={approveMut.isPending || rejectMut.isPending}
                          testId={`insurer-request-approve-${r.id}`}
                        >
                          Annehmen & Einladen
                        </Btn>
                      </div>
                    </div>
                    {approveMut.isError && approveMut.variables === r.id && (
                      <p style={{ color: '#a32d2d', fontSize: 12, margin: '12px 0 0' }}>
                        {(approveMut.error as Error).message ?? 'Annahme fehlgeschlagen.'}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {decided.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                Bearbeitet ({decided.length})
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {decided.map((r) => {
                  const isOpen = openId === r.id;
                  return (
                    <Card key={r.id} style={{ padding: '14px 20px' }} data-testid={`insurer-request-${r.id}`}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setOpenId(isOpen ? null : r.id)}
                      >
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>{r.company}</span>
                          <span style={{ fontSize: 12, color: '#888780', marginLeft: 8 }}>{r.contactEmail}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[r.status] }}>{STATUS_LABEL[r.status]}</span>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(168,168,156,0.2)' }}>
                          <div style={{ display: 'grid', gap: 6, fontSize: 12, color: '#55544f' }}>
                            <div>Kontakt: {r.contactName}</div>
                            {r.message && <div>Nachricht: {r.message}</div>}
                            <div>
                              Erstellt: {new Date(r.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                            {r.status === 'approved' && (
                              <Btn
                                small
                                variant="secondary"
                                onClick={() => resendMut.mutate(r.id)}
                                disabled={resendMut.isPending}
                                testId={`insurer-request-resend-${r.id}`}
                              >
                                E-Mail erneut senden
                              </Btn>
                            )}
                            <Btn
                              small
                              variant="danger"
                              onClick={() => deleteMut.mutate(r.id)}
                              disabled={deleteMut.isPending}
                              testId={`insurer-request-delete-${r.id}`}
                            >
                              Aus Verlauf löschen
                            </Btn>
                          </div>

                          {resendMut.isError && resendMut.variables === r.id && (
                            <p style={{ color: '#a32d2d', fontSize: 12, margin: '12px 0 0' }}>
                              {(resendMut.error as Error).message ?? 'Senden fehlgeschlagen.'}
                            </p>
                          )}
                          {resendMut.isSuccess && resendMut.variables === r.id && (
                            <p style={{ color: '#0f6e56', fontSize: 12, margin: '12px 0 0' }}>E-Mail wurde erneut gesendet.</p>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
