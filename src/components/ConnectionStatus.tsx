import React from 'react';
import { WifiOff, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Props {
  lastUpdate?: string;
  clienteLastUpdate?: string;
  showClientUpdate?: boolean;
}

const checkApiConnection = async () => {
  try {
    await axios.get('/api/health');
    return true;
  } catch {
    return false;
  }
};

export const ConnectionStatus: React.FC<Props> = ({ 
  lastUpdate,
  clienteLastUpdate,
  showClientUpdate 
}) => {
  const { data: isConnected = false } = useQuery({
    queryKey: ['apiConnection'],
    queryFn: checkApiConnection,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  return (
    <div className="flex items-center gap-2">
      {!isConnected ? (
        <>
          <WifiOff className="w-4 h-4 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-sm text-yellow-600">Trabajando sin conexión</span>
            {lastUpdate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Última actualización del listado: {lastUpdate}
              </span>
            )}
            {showClientUpdate && clienteLastUpdate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Última actualización del cliente: {clienteLastUpdate}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-green-600">API Conectada</span>
        </>
      )}
    </div>
  );
};