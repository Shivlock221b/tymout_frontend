import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * ConfirmDialog Component
 * 
 * Single Responsibility: Provides a confirmation dialog for destructive actions
 */
const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isProcessing = false,
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;
  
  // Determine color scheme based on type
  const colorScheme = {
    danger: {
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
      border: 'border-red-300'
    },
    warning: {
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      border: 'border-yellow-300'
    },
    info: {
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-300'
    }
  }[type];
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Dialog */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto z-10 relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center">
            <div className={`mr-4 flex-shrink-0 ${colorScheme.icon}`}>
              <FaExclamationTriangle size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
          </div>
          
          {/* Body */}
          <div className="px-6 py-2">
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isProcessing}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorScheme.button}`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isProcessing: PropTypes.bool,
  type: PropTypes.oneOf(['danger', 'warning', 'info'])
};

export default ConfirmDialog;
