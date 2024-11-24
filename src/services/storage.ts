import { ApiClienteResponse, ApiMovement } from '../types/client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ClienteCache extends CacheEntry<ApiClienteResponse[]> {}
interface MovimientosCache extends CacheEntry<ApiMovement[]> {}

const CACHE_KEYS = {
  CLIENTES: 'clientes_cache',
  MOVIMIENTOS_PREFIX: 'movimientos_cache_',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
};

export const storage = {
  saveClientes: (clientes: ApiClienteResponse[]): void => {
    const cache: ClienteCache = {
      data: clientes,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEYS.CLIENTES, JSON.stringify(cache));
  },

  getClientes: (): ClienteCache | null => {
    const cached = localStorage.getItem(CACHE_KEYS.CLIENTES);
    if (!cached) return null;
    return JSON.parse(cached);
  },

  saveMovimientos: (clienteId: string, movimientos: ApiMovement[]): void => {
    const cache: MovimientosCache = {
      data: movimientos,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      `${CACHE_KEYS.MOVIMIENTOS_PREFIX}${clienteId}`,
      JSON.stringify(cache)
    );
  },

  getMovimientos: (clienteId: string): MovimientosCache | null => {
    const cached = localStorage.getItem(
      `${CACHE_KEYS.MOVIMIENTOS_PREFIX}${clienteId}`
    );
    if (!cached) return null;
    return JSON.parse(cached);
  },

  isCacheValid: (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_KEYS.CACHE_DURATION;
  },

  formatLastUpdate: (timestamp: number): string => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  },
};