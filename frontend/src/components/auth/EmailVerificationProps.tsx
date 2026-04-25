import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { authService } from '../../services/authService';

interface EmailVerificationProps {
  isOpen: boolean;
  email: string;
  onVerify: (code: string) => Promise<void>;
  onClose: () => void;
}

export function EmailVerification({ isOpen, email, onVerify, onClose }: EmailVerificationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
      setResendMessage('');
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  if (!isOpen) return null;

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);

    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`code-${lastIndex}`)?.focus();
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(verificationCode);
      // Don't close here, let the parent component handle it
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    
    setResendLoading(true);
    setError('');
    setResendMessage('');
    
    try {
      await authService.resendVerification(email);
      setResendMessage('New verification code sent!');
      setResendDisabled(true);
      setCountdown(60); // 60 seconds countdown
      // Clear the previous code input
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setResendMessage('');
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[10px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] w-full max-w-[448px]">
        {/* Header */}
        <div className="relative flex items-center justify-between h-[80.875px] pb-[0.889px] px-[24px] border-b border-[rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-[8px]">
            <h2 className="font-bold leading-[32px] text-[#0a0a0a] text-[24px]">
              Verify Your Email
            </h2>
          </div>
          <button
            onClick={onClose}
            className="size-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4 text-[#99A1AF]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-[24px] pt-[24px] pb-[24px]">
          {/* Icon Container */}
          <div className="flex flex-col items-center mb-[24px]">
            <div className="bg-[#ffedd4] flex items-center justify-center rounded-full size-[64px] mb-[16px]">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            
            <p className="font-normal leading-[24px] text-[#4a5565] text-[16px] text-center">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-semibold leading-[24px] text-[#101828] text-[16px] text-center mt-[8px]">
              {email}
            </p>
            <p className="font-normal leading-[20px] text-[#6a7282] text-[14px] text-center mt-[8px]">
              Check your console for the code (development mode)
            </p>
          </div>

          {/* Code Input */}
          <div className="mb-[24px]">
            <label className="block font-medium leading-[20px] text-[#364153] text-[14px] text-center mb-[12px]">
              Enter Verification Code
            </label>
            <div className="flex gap-[8px] justify-center" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-[48px] h-[56px] text-center text-2xl font-bold border-[1.778px] border-[#d1d5dc] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  disabled={loading}
                  autoComplete="off"
                />
              ))}
            </div>
            {error && (
              <p className="text-red-600 text-sm text-center mt-2">{error}</p>
            )}
            {resendMessage && (
              <p className="text-green-600 text-sm text-center mt-2">{resendMessage}</p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !isCodeComplete}
            className={`w-full h-[48px] rounded-[10px] font-medium text-[16px] text-white flex items-center justify-center gap-2 transition-colors ${
              loading || !isCodeComplete
                ? 'bg-[#99a1af] cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendCode}
                disabled={resendDisabled || resendLoading}
                className={`text-orange-600 hover:text-orange-700 font-medium transition-colors ${
                  resendDisabled ? 'cursor-not-allowed text-gray-400' : ''
                }`}
              >
                {resendLoading ? (
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : resendDisabled ? (
                  `Resend in ${countdown}s`
                ) : (
                  'Resend Verification Code'
                )}
              </button>
            </p>
            {resendDisabled && countdown > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                You can request a new code in {countdown} seconds
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}