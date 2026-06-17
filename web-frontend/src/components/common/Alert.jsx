import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', title, message, onClose }) => {
  const icons = { success: CheckCircle, error: XCircle, warning: AlertCircle, info: Info };
  const Icon = icons[type] || Info;
  const colors = { success: 'bg-green-50 border-green-500 text-green-800', error: 'bg-red-50 border-red-500 text-red-800', warning: 'bg-yellow-50 border-yellow-500 text-yellow-800', info: 'bg-blue-50 border-blue-500 text-blue-800' };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${colors[type]} relative`}>
      <div className="flex items-start">
        <Icon className="w-5 h-5 mr-3 mt-0.5" />
        <div><h4 className="font-semibold">{title}</h4>{message && <p className="text-sm mt-1">{message}</p>}</div>
        {onClose && <button onClick={onClose} className="absolute top-4 right-4">×</button>}
      </div>
    </div>
  );
};

export default Alert;
