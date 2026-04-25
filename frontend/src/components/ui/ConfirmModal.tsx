import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ConfirmModalProps {
  isOpen: boolean;
  type?: ModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  showCancel?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  type = 'confirm',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  showCancel = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />;
      case 'info':
        return <Info className="w-12 h-12 text-blue-600" />;
      default:
        return <AlertCircle className="w-12 h-12 text-orange-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'error':
        return 'bg-red-100';
      case 'warning':
        return 'bg-yellow-100';
      case 'info':
        return 'bg-blue-100';
      default:
        return 'bg-orange-100';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-orange-600 hover:bg-orange-700';
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`${getIconBgColor()} rounded-full p-3 flex-shrink-0`}>
              {getIcon()}
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
          {showCancel && !isLoading && (
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          {showCancel && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${getConfirmButtonColor()}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}