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
      className="modal-overlay modal-overlay-portal" 
      onClick={onClose}
    >
      <div 
        className="glass-panel clay-card-3d user-modal-sm text-center" 
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="otp-modal-icon">📧</div>

        <h3 className="user-modal-title">
          Enter Verification Code
        </h3>

        <p className="user-modal-subtitle">
          We've sent a 6-digit secure OTP code to:<br />
          <strong className="text-violet">{email}</strong>
        </p>

        {error && (
          <div className="user-modal-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="otp-digits-container" onPaste={handlePaste}>
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
                className={`otp-digit-input ${digit ? 'filled' : ''}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full otp-submit-btn"
            disabled={!isComplete || loading}
          >
            {loading ? 'Verifying OTP...' : 'Verify & Continue →'}
          </button>
        </form>

        <div className="otp-footer-row">
          <span>Didn't receive code?</span>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendClick}
              className="otp-resend-btn"
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
