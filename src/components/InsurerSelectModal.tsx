import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, AlertCircle, Building2, KeyRound } from 'lucide-react';
import { apiClient } from '../api/client.js';
import { Modal, Btn, GlassInput, FieldLabel } from './ui.js';
import { validateKvnr, formatKvnrInput } from '../lib/kvnr.js';
import type { PublicOrganization, User } from '../api/types.js';

interface InsurerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (orgName: string) => void;
}

export function InsurerSelectModal({ isOpen, onClose, onSuccess }: InsurerSelectModalProps) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<User>('/me'),
    enabled: isOpen,
  });

  const { data: organizations, isLoading: orgsLoading } = useQuery<PublicOrganization[]>({
    queryKey: ['organizations', 'public-list'],
    queryFn: () => apiClient<PublicOrganization[]>('/organizations/public-list'),
    enabled: isOpen,
  });

  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [kvnr, setKvnr] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [useJoinCode, setUseJoinCode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const kvnrValidation = kvnr ? validateKvnr(kvnr) : null;

  const joinMut = useMutation({
    mutationFn: async () => {
      setError(null);
      if (useJoinCode) {
        if (!joinCode.trim()) throw new Error('Bitte Beitrittscode eingeben.');
        return apiClient<{ ok: boolean; organizationName: string }>('/organizations/join', {
          method: 'POST',
          body: JSON.stringify({ joinCode: joinCode.trim() }),
        });
      } else {
        if (!selectedOrgId) throw new Error('Bitte wähle deine Krankenkasse aus.');
        if (!kvnrValidation?.valid) {
          throw new Error(kvnrValidation?.error || 'Ungültige Krankenversichertennummer.');
        }
        return apiClient<{ ok: boolean; organizationName: string }>('/organizations/join', {
          method: 'POST',
          body: JSON.stringify({ organizationId: selectedOrgId, kvnr: kvnrValidation.normalized }),
        });
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      if (onSuccess) onSuccess(data.organizationName);
      onClose();
    },
    onError: (err: unknown) => {
      setError((err as Error).message ?? 'Verifikation fehlgeschlagen.');
    },
  });

  const leaveMut = useMutation({
    mutationFn: async () => {
      await apiClient('/organizations/leave', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      onClose();
    },
    onError: (err: unknown) => {
      setError((err as Error).message ?? 'Krankenkasse konnte nicht getrennt werden.');
    },
  });

  if (!isOpen) return null;

  const isCurrentLinked = !!user?.organizationId;
  const currentOrgName = user?.organization?.name ?? 'Partner-Krankenkasse';

  return (
    <Modal onClose={onClose}>
      <div style={{ maxWidth: 460, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(29,158,117,0.12)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: '#0f6e56',
          }}>
            <Building2 size={18} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#22221f' }}>
            {isCurrentLinked ? 'Krankenkassen-Mitgliedschaft' : 'Krankenkasse verknüpfen'}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.6, marginBottom: 20 }}>
          {isCurrentLinked
            ? `Dein Konto ist aktuell mit der ${currentOrgName} verifiziert. Du erhältst exklusive Kassen-Boni und Tarife nach § 65a SGB V.`
            : 'Wähle deine gesetzliche oder private Krankenkasse und verifiziere deine Mitgliedschaft, um exklusive Partner-Prämien und Kassen-Tarife freizuschalten.'}
        </p>

        {isCurrentLinked ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              padding: '16px 18px', borderRadius: 14,
              background: 'rgba(29,158,117,0.08)', border: '1px solid rgba(29,158,117,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 11, color: '#0f6e56', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                  Status: Aktiv verifiziert ✓
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1d2c25' }}>
                  {currentOrgName}
                </div>
                {user?.organizationVerifiedAt && (
                  <div style={{ fontSize: 11, color: '#688277', marginTop: 3 }}>
                    Verifiziert am {new Date(user.organizationVerifiedAt).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
              <ShieldCheck size={28} color="#0f6e56" />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Btn variant="danger" small onClick={() => leaveMut.mutate()} disabled={leaveMut.isPending} testId="leave-org-btn">
                {leaveMut.isPending ? 'Wird getrennt…' : 'Krankenkasse trennen'}
              </Btn>
              <Btn variant="secondary" onClick={onClose}>
                Schließen
              </Btn>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); joinMut.mutate(); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {!useJoinCode ? (
                <>
                  <div>
                    <FieldLabel>Partner-Krankenkasse auswählen</FieldLabel>
                    <select
                      data-testid="insurer-select-dropdown"
                      value={selectedOrgId}
                      onChange={(e) => {
                        setSelectedOrgId(e.target.value);
                        setError(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: 12,
                        border: '1px solid rgba(0,0,0,0.12)',
                        background: 'rgba(255,255,255,0.85)',
                        fontSize: 13,
                        fontFamily: 'inherit',
                        color: '#22221f',
                        outline: 'none',
                      }}
                    >
                      <option value="">-- Bitte Krankenkasse wählen --</option>
                      {organizations?.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    {orgsLoading && (
                      <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>Kassen werden geladen…</div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FieldLabel>Krankenversichertennummer (KVNR)</FieldLabel>
                      {kvnrValidation?.valid && (
                        <span style={{ fontSize: 11, color: '#0f6e56', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Check size={12} /> Prüfziffer gültig
                        </span>
                      )}
                    </div>
                    <GlassInput
                      type="text"
                      placeholder="z. B. A123456789"
                      value={kvnr}
                      onChange={(val) => {
                        setKvnr(formatKvnrInput(val));
                        setError(null);
                      }}
                      testId="kvnr-input"
                      name="kvnr"
                    />
                    <div style={{ fontSize: 11, color: kvnr && !kvnrValidation?.valid ? '#c0392b' : '#888780', marginTop: 4 }}>
                      {kvnr && !kvnrValidation?.valid
                        ? kvnrValidation?.error
                        : '10-stellig (1 Buchstabe + 9 Ziffern auf deiner Gesundheitskarte eGK)'}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <FieldLabel>Aktionscode / Beitrittscode der Kasse</FieldLabel>
                  <GlassInput
                    type="text"
                    placeholder="8-stelliger Code"
                    value={joinCode}
                    onChange={(val) => {
                      setJoinCode(val.trim());
                      setError(null);
                    }}
                    testId="joincode-input"
                    name="joinCode"
                  />
                  <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>
                    Code aus dem Versichertenmagazin oder Kundenportal deiner Kasse.
                  </div>

                  {joinCode && validateKvnr(joinCode).valid && (
                    <div style={{
                      marginTop: 8, padding: '10px 12px', borderRadius: 10,
                      background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)',
                      fontSize: 12, color: '#92400e',
                    }}>
                      <div>💡 <strong>Hinweis:</strong> Dies ist eine Krankenversichertennummer (KVNR), kein Aktionscode.</div>
                      <button
                        type="button"
                        onClick={() => {
                          setKvnr(joinCode);
                          setUseJoinCode(false);
                          setError(null);
                        }}
                        style={{
                          marginTop: 6, background: '#d97706', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 500,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                        data-testid="switch-to-kvnr-btn"
                      >
                        Als KVNR übernehmen & zur Kassen-Auswahl wechseln →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Zero-Knowledge Privacy Explanation Card */}
              <div style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(29,158,117,0.06)',
                border: '1px solid rgba(29,158,117,0.18)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <ShieldCheck size={18} color="#0f6e56" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 11, color: '#385348', lineHeight: 1.5 }}>
                  <strong>Datenschutz (Art. 9 DSGVO):</strong> Deine KVNR wird ausschließlich als kryptografischer Einweg-Hash gespeichert. LONGEVITY speichert keine Klartext-Versichertennummer in der Datenbank.
                </div>
              </div>

              {error && (
                <div data-testid="insurer-error" style={{ fontSize: 12, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setUseJoinCode(!useJoinCode);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 12,
                    color: '#0f6e56',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <KeyRound size={13} />
                  {useJoinCode ? 'Zurück zur KVNR-Verifikation' : 'Ich habe stattdessen einen Aktionscode'}
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="secondary" onClick={onClose}>
                    Abbrechen
                  </Btn>
                  <Btn
                    type="submit"
                    variant="primary"
                    disabled={joinMut.isPending || (!useJoinCode && (!selectedOrgId || !kvnrValidation?.valid)) || (useJoinCode && !joinCode.trim())}
                    testId="submit-insurer-btn"
                  >
                    {joinMut.isPending ? 'Verifiziere…' : 'Verifizieren & Verknüpfen'}
                  </Btn>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
