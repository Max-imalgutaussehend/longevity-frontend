import { useState } from 'react';
import { Modal, FieldLabel, GlassInput, Btn } from '../../components/ui.js';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  deleteRequested: boolean;
  deleteError: string | null;
  onConfirmDelete: (password: string) => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  isPending,
  deleteRequested,
  deleteError,
  onConfirmDelete,
}: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirmDelete(password);
  };

  return (
    <Modal onClose={handleClose}>
      {deleteRequested ? (
        <>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#0f6e56', marginBottom: 8 }}>
            Bestätigungs-E-Mail gesendet
          </div>
          <p
            data-testid="delete-request-sent"
            style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 20 }}
          >
            Wir haben dir eine E-Mail gesendet. Bitte klicke auf den Bestätigungslink, um dein Konto endgültig zu löschen. Der Link ist 30 Minuten gültig.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={handleClose}>
              Schließen
            </Btn>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 16, fontWeight: 500, color: '#a32d2d', marginBottom: 8 }}>
            Konto unwiderruflich löschen
          </div>
          <p style={{ fontSize: 13, color: '#55544f', lineHeight: 1.7, marginBottom: 16 }}>
            Gelöscht werden: alle Messwerte, Score-Snapshots, Nachweise und dein Konto. Diese Aktion ist nicht umkehrbar. Wir senden dir zur Bestätigung einen Link per E-Mail.
          </p>
          <div style={{ marginBottom: 20 }}>
            <FieldLabel htmlFor="delete-account-password">Passwort zur Bestätigung</FieldLabel>
            <GlassInput
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              placeholder="Dein Passwort"
              value={password}
              onChange={setPassword}
            />
          </div>
          {deleteError && (
            <div style={{
              fontSize: 12,
              color: '#a32d2d',
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'rgba(163,45,45,0.08)',
              border: '1px solid rgba(163,45,45,0.2)',
              lineHeight: 1.5,
            }}>
              {deleteError}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={handleClose}>
              Abbrechen
            </Btn>
            <Btn
              variant="danger"
              onClick={handleConfirm}
              testId="confirm-delete-account"
              disabled={isPending}
            >
              {isPending ? 'Sende…' : 'Löschung anfordern'}
            </Btn>
          </div>
        </>
      )}
    </Modal>
  );
}
