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

function parseInquiry(r: InsurerRequest) {
  const msg = r.message ?? '';
  let reasonLabel = 'Krankenkasse / Kooperation';
  let cleanMessage = msg;
  let isInsurer = true;

  if (msg.startsWith('[Anliegen:')) {
    const match = msg.match(/^\[Anliegen:\s*([^\]]+)\]\s*\n\n?([\s\S]*)$/);
    if (match) {
      reasonLabel = match[1].trim();
      cleanMessage = match[2].trim();
      isInsurer = reasonLabel.toLowerCase().includes('krankenkasse');
    }
  } else if (
    ['Community / Feedback', 'Forschung & DHBW', 'Privatperson / Allgemein', 'Nutzer Feedback', 'Allgemeine Anfrage'].includes(r.company)
  ) {
    isInsurer = false;
    reasonLabel = r.company;
  }

  let badgeColor = '#0f6e56';
  let badgeBg = 'rgba(15, 110, 86, 0.1)';
  let icon = '🏥';

  if (reasonLabel.toLowerCase().includes('feedback')) {
    badgeColor = '#b45309';
    badgeBg = 'rgba(230, 160, 30, 0.12)';
    icon = '💡';
  } else if (reasonLabel.toLowerCase().includes('forschung')) {
    badgeColor = '#4f46e5';
    badgeBg = 'rgba(99, 102, 241, 0.12)';
    icon = '🎓';
  } else if (!isInsurer) {
    badgeColor = '#475569';
    badgeBg = 'rgba(100, 116, 139, 0.12)';
    icon = '💬';
  }

  return {
    isInsurer,
    reasonLabel,
    cleanMessage,
    badgeColor,
    badgeBg,
    icon,
  };
}

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
      <PageTitle title="Krankenkassen- & Kontakt-Anfragen" sub="Erstkontakt-Anfragen prüfen, Krankenkassen freigeben oder direkt per E-Mail antworten" />

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
                {pending.map((r) => {
                  const inquiry = parseInquiry(r);
                  return (
                    <Card key={r.id} style={{ padding: 20 }} data-testid={`insurer-request-${r.id}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 600, color: '#22221f' }}>{r.company}</span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 999,
                                background: inquiry.badgeBg,
                                color: inquiry.badgeColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <span>{inquiry.icon}</span>
                              <span>{inquiry.reasonLabel}</span>
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: '#55544f' }}>
                            {r.contactName} · <a href={`mailto:${r.contactEmail}`} style={{ color: '#0f6e56', textDecoration: 'none' }}>{r.contactEmail}</a>
                          </div>
                          {inquiry.cleanMessage && (
                            <div
                              style={{
                                fontSize: 13,
                                color: '#374151',
                                marginTop: 10,
                                padding: '10px 14px',
                                background: 'rgba(240, 244, 241, 0.65)',
                                borderRadius: 8,
                                border: '1px solid rgba(168, 168, 156, 0.25)',
                                maxWidth: 620,
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.5,
                              }}
                            >
                              {inquiry.cleanMessage}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: '#a3a29c', marginTop: 8 }}>
                            {new Date(r.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                          {inquiry.isInsurer ? (
                            <>
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
                            </>
                          ) : (
                            <>
                              <a
                                href={`mailto:${r.contactEmail}?subject=Re: Ihre Anfrage bei LONGEVITY&body=Hallo ${encodeURIComponent(r.contactName)},%0D%0A%0D%0Avielen Dank für Ihre Kontaktaufnahme.`}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '7px 12px',
                                  fontSize: 12,
                                  fontWeight: 500,
                                  borderRadius: 8,
                                  background: '#0f6e56',
                                  color: '#ffffff',
                                  textDecoration: 'none',
                                }}
                              >
                                ✉️ Per E-Mail antworten
                              </a>
                              <Btn
                                small
                                variant="secondary"
                                onClick={() => rejectMut.mutate(r.id)}
                                disabled={rejectMut.isPending}
                                testId={`insurer-request-reject-${r.id}`}
                              >
                                Als erledigt markieren
                              </Btn>
                            </>
                          )}
                        </div>
                      </div>
                      {approveMut.isError && approveMut.variables === r.id && (
                        <p style={{ color: '#a32d2d', fontSize: 12, margin: '12px 0 0' }}>
                          {(approveMut.error as Error).message ?? 'Annahme fehlgeschlagen.'}
                        </p>
                      )}
                    </Card>
                  );
                })}
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
                  const inquiry = parseInquiry(r);
                  const isErledigt = !inquiry.isInsurer && r.status === 'rejected';
                  const displayStatus = isErledigt ? 'Erledigt' : STATUS_LABEL[r.status];
                  const displayColor = isErledigt ? '#55544f' : STATUS_COLOR[r.status];

                  return (
                    <Card key={r.id} style={{ padding: '14px 20px' }} data-testid={`insurer-request-${r.id}`}>
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => setOpenId(isOpen ? null : r.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#22221f' }}>{r.company}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: 999,
                              background: inquiry.badgeBg,
                              color: inquiry.badgeColor,
                            }}
                          >
                            {inquiry.icon} {inquiry.reasonLabel}
                          </span>
                          <span style={{ fontSize: 12, color: '#888780' }}>{r.contactEmail}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: displayColor }}>{displayStatus}</span>
                      </div>

                      {isOpen && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(168,168,156,0.2)' }}>
                          <div style={{ display: 'grid', gap: 6, fontSize: 12, color: '#55544f' }}>
                            <div>Kontakt: {r.contactName}</div>
                            {inquiry.cleanMessage && <div>Nachricht: {inquiry.cleanMessage}</div>}
                            <div>
                              Erstellt: {new Date(r.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                            <a
                              href={`mailto:${r.contactEmail}?subject=Re: Ihre Anfrage bei LONGEVITY`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 500,
                                borderRadius: 8,
                                background: '#f0f4f1',
                                color: '#0f6e56',
                                textDecoration: 'none',
                                border: '1px solid rgba(29, 158, 117, 0.3)',
                              }}
                            >
                              ✉️ E-Mail schreiben
                            </a>
                            {r.status === 'approved' && (
                              <Btn
                                small
                                variant="secondary"
                                onClick={() => resendMut.mutate(r.id)}
                                disabled={resendMut.isPending}
                                testId={`insurer-request-resend-${r.id}`}
                              >
                                Einladung erneut senden
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
