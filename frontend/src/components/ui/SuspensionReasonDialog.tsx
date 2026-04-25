import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SuspensionReasonDialogProps {
  isOpen: boolean;
  userName: string;
  userType: 'Chef' | 'User';
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function SuspensionReasonDialog({
  isOpen,
  userName,
  userType,
  onConfirm,
  onClose,
}: SuspensionReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for suspension');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Suspend {userType}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-4">
          You are about to suspend <span className="font-semibold">{userName}</span>. 
          They will not be able to access the platform until unsuspended. Please provide a reason for this action.
        </p>

        {/* Reason Input */}
        <div className="mb-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Suspension Reason <span className="text-red-600">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="Enter the reason for suspension..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow resize-none"
            rows={4}
          />
          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Suspend {userType}
          </button>
        </div>
      </div>
    </div>
  );
}
