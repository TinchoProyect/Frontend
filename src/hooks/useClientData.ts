import { useQuery } from '@tanstack/react-query';
import { fetchClientData } from '../services/api';
import { saldoInicialService } from '../services/saldoInicial';
import { ProcessedClientData } from '../types/client';
import { transformMovement, calculateBalances } from '../utils/dataTransform';

const saldoService = new saldoInicialService();

export const useClientData = (clienteId: string | null, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['clientData', clienteId],
    queryFn: async (): Promise<ProcessedClientData | null> => {
      if (!clienteId) return null;

      try {
        const [movimientosResponse, saldoInicial] = await Promise.all([
          fetchClientData(clienteId),
          saldoService.obtenerSaldoInicial(clienteId)
        ]);

        // Transform API movements to processed movements
        const processedMovements = movimientosResponse.data.map(transformMovement);

        // Calculate balances with saldo inicial
        const movimientosConSaldo = calculateBalances(
          processedMovements,
          saldoInicial?.monto || 0
        );

        return {
          clienteId,
          movimientos: movimientosConSaldo,
          saldoInicial,
          fromCache: movimientosResponse.fromCache,
          lastUpdate: movimientosResponse.lastUpdate
        };
      } catch (error) {
        console.error('Error fetching client data:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al obtener datos del cliente');
      }
    },
    enabled: Boolean(clienteId) && enabled,
    staleTime: 300000,
    gcTime: 3600000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};