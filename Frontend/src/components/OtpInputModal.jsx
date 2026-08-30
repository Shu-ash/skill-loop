// src/components/OtpInputModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function OtpInputModal({
  isOpen,
  onClose,
  email,
  purpose = 'verify',
  onVerify,
  onResend,
  loading = false,
  error = ''
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setTimer(60);
      setCanResend(false);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length === 6) {
      onVerify(fullOtp);
    }
  };

  const handleResendClick = () => {
    if (!canResend) return;
    setTimer(60);
    setCanResend(false);
    if (onResend) onResend();
  };

  const isComplete = otpDigits.every((d) => d !== '');

  const modalJSX = (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div 
        className="glass-panel clay-card-3d" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', width: '100%', padding: '2.2rem 2rem', borderRadius: '24px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '2.8rem', marginBottom: '0.6rem' }}>📧</div>

        <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
          Enter Verification Code
        </h3>

        <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
          We've sent a 6-digit secure OTP code to:<br />
          <strong style={{ color: 'var(--violet-primary, #6c5ce7)' }}>{email}</strong>
        </p>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.2rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.6rem' }} onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '46px',
                  height: '52px',
                  textAlign: 'center',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  border: digit ? '2px solid var(--violet-primary, #6c5ce7)' : '1.5px solid rgba(203, 213, 225, 0.8)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'inherit',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={!isComplete || loading}
            style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '14px', marginBottom: '1rem' }}
          >
            {loading ? 'Verifying OTP...' : 'Verify & Continue →'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: 'var(--slate-500)' }}>
          <span>Didn't receive code?</span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendClick}
              style={{ background: 'none', border: 'none', color: 'var(--violet-primary, #6c5ce7)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              🔄 Resend OTP
            </button>
          ) : (
            <span>Resend in <strong>{timer}s</strong></span>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
