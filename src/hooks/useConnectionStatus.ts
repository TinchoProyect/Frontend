import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const queryClient = useQueryClient();

  const checkConnection = useCallback(async () => {
    try {
      await axios.get('/api/health');
      const wasDisconnected = !isConnected;
      setIsConnected(true);
      
      // Si estábamos desconectados y ahora hay conexión, invalidamos las queries
      if (wasDisconnected) {
        queryClient.invalidateQueries({ queryKey: ['clientes'] });
        queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      }
    } catch (error) {
      setIsConnected(false);
    }
  }, [isConnected, queryClient]);

  useEffect(() => {
    const interval = setInterval(checkConnection, 30000);
    checkConnection();

    return () => clearInterval(interval);
  }, [checkConnection]);

  return { isConnected };
};