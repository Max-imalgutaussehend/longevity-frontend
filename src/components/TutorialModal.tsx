import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ArrowLeft, ArrowRight, Lightbulb, Sparkles } from 'lucide-react';
import { ConsentModal } from './ConsentModal.js';
import { Btn } from './ui.js';
import brandIcon from '../assets/brand-icon.png';
import { apiClient } from '../api/client.js';
import type { User } from '../api/types.js';
import { APP_ROUTES } from '../lib/routes.js';
import { ConfettiCanvas } from './tutorial/ConfettiCanvas.js';
import { TutorialStepArchetype } from './tutorial/TutorialStepArchetype.js';
import { TutorialStepSources } from './tutorial/TutorialStepSources.js';
import { TutorialStepScore } from './tutorial/TutorialStepScore.js';
import { TutorialStepLevers } from './tutorial/TutorialStepLevers.js';
import { TutorialStepBenefits } from './tutorial/TutorialStepBenefits.js';
import type { TutorialModalProps, ConsentStatus } from './tutorial/tutorialTypes.js';

export type { TutorialModalProps };

/**
 * Interactive 5-step tutorial dialog explaining longevity principles and features.
 * Composed into modular steps under `./tutorial/`.
 */
export function TutorialModal({ isOpen, onClose, initialStep = 1 }: TutorialModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(initialStep);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [mockSuccess, setMockSuccess] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<User>('/me'),
  });

  const { data: consentData } = useQuery<ConsentStatus>({
    queryKey: ['account', 'consent'],
    queryFn: () => apiClient<ConsentStatus>('/account/consent'),
  });

  const generateMockMutation = useMutation({
    mutationFn: async () => apiClient<{ ok: boolean; sampleCount?: number }>('/sources/mock/generate', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['score'] });
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setMockSuccess(true);
    },
  });

  // Reset step whenever modal is reopened
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    }
  }, [isOpen, initialStep]);

  const handleTriggerMock = () => {
    if (consentData?.hasConsented) {
      generateMockMutation.mutate();
    } else {
      setShowConsentModal(true);
    }
  };

  const handleClose = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem('longevity_tutorial_completed', 'true');
      if (user?.id) {
        localStorage.setItem(`longevity_tutorial_completed_${user.id}`, 'true');
      }
    }
    window.dispatchEvent(new CustomEvent('tutorial-completed'));
    onClose();
  }, [dontShowAgain, onClose, user?.id]);

  const handleNavigateAndClose = (route: string) => {
    handleClose();
    navigate(route);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowRight') setStep((s) => Math.min(5, s + 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(1, s - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Longevity Guide"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={handleClose}
      >
        <div
          className="glass-panel"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 680,
            background: 'rgba(255, 255, 255, 0.96)',
            borderRadius: 24,
            boxShadow: '0 30px 80px -15px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '94vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {step === 5 && <ConfettiCanvas />}

          {/* Top Header Bar */}
          <div style={{
            padding: '18px 28px 14px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(29,158,117,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
              }}>
                <img src={brandIcon} alt="Logo" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f6e56', letterSpacing: '0.01em' }}>
                  LONGEVITY GUIDE
                </div>
                <div style={{ fontSize: 11, color: '#888780' }}>Interaktive Entdeckungsreise</div>
              </div>
            </div>

            {/* Stepper Dots & Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  title={`Schritt ${s}`}
                  style={{
                    height: 7,
                    width: step === s ? 28 : 7,
                    borderRadius: 99,
                    background: step === s ? '#0f6e56' : 'rgba(0,0,0,0.14)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleClose}
              title="Schließen (Esc)"
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: 99,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#55544f',
                transition: 'background 0.15s',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content Area */}
          <div style={{
            padding: '24px 32px 28px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            animation: 'stepSlideIn 0.22s ease-out',
          }}>
            {step === 1 && <TutorialStepArchetype />}
            {step === 2 && (
              <TutorialStepSources
                mockSuccess={mockSuccess}
                isPending={generateMockMutation.isPending}
                onTriggerMock={handleTriggerMock}
              />
            )}
            {step === 3 && <TutorialStepScore />}
            {step === 4 && <TutorialStepLevers />}
            {step === 5 && (
              <TutorialStepBenefits
                mockSuccess={mockSuccess}
                isPending={generateMockMutation.isPending}
                onTriggerMock={handleTriggerMock}
                onNavigate={handleNavigateAndClose}
                dontShowAgain={dontShowAgain}
                onToggleDontShowAgain={setDontShowAgain}
              />
            )}
          </div>

          {/* Modal Footer Controls */}
          <div style={{
            padding: '16px 28px',
            background: 'rgba(247, 247, 245, 0.85)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              {step > 1 ? (
                <Btn variant="ghost" small onClick={() => setStep((s) => s - 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowLeft size={14} /> Zurück
                </Btn>
              ) : (
                <span style={{ fontSize: 12, color: '#888780', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Lightbulb size={13} color="#f59e0b" /> Tipp: Navigation auch mit Pfeiltasten
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {step < 5 ? (
                <Btn onClick={() => setStep((s) => s + 1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  Weiter <ArrowRight size={14} />
                </Btn>
              ) : (
                <Btn
                  onClick={() => handleNavigateAndClose(APP_ROUTES.app.dashboard())}
                  className="anim-shimmer"
                  style={{ color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  Weiter zum Onboarding <Sparkles size={14} />
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        sourceLabel="90 Tage Testdaten (Mock)"
        onConsented={() => generateMockMutation.mutate()}
      />
    </>
  );
}
