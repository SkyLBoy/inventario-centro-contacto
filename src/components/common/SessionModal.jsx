import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SessionModal = () => {
  const { sessionExpired, extendSession, logout, getRemainingTime } = useAuth();
  const [remainingTime, setRemainingTime] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (sessionExpired) {
      setShowModal(true);
      setRemainingTime(getRemainingTime());
      
      // Actualizar contador cada segundo
      const interval = setInterval(() => {
        const time = getRemainingTime();
        setRemainingTime(time);
        
        if (time <= 0) {
          clearInterval(interval);
          logout(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShowModal(false);
    }
  }, [sessionExpired, getRemainingTime, logout]);

  const handleExtendSession = () => {
    extendSession();
    setShowModal(false);
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="bg-yellow-100 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Sesión por Expirar
            </h3>
            <p className="text-sm text-gray-600">
              Tu sesión está a punto de caducar
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-2xl font-mono font-bold text-gray-800">
              {formatTime(remainingTime)}
            </span>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Tiempo restante para cerrar sesión automáticamente
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Extender Sesión
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Por seguridad, las sesiones expiran después de 30 minutos de inactividad
        </p>
      </div>
    </div>
  );
};

export default SessionModal;