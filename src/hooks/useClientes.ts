import { useQuery } from '@tanstack/react-query';
import { fetchClientes } from '../services/api';
import { ApiClienteResponse, ClienteFormateado } from '../types/client';

const formatearCliente = (apiCliente: ApiClienteResponse): ClienteFormateado => {
  const numero = apiCliente["Número"]?.toString() || '0';
  const nombre = apiCliente["Nombre"]?.trim() || '';
  const apellido = apiCliente["Apellido"]?.trim() || '';
  
  return {
    id: numero,
    numeroFormateado: numero.padStart(3, '0'),
    nombreCompleto: [apellido, nombre].filter(Boolean).join(', '),
    label: `${numero.padStart(3, '0')} - ${[apellido, nombre].filter(Boolean).join(', ')}`
  };
};

export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
    select: (response) => ({
      clientes: response.data
        .filter(cliente => 
          cliente["Número"] != null && 
          (cliente["Nombre"]?.trim() || cliente["Apellido"]?.trim())
        )
        .map(formatearCliente),
      fromCache: response.fromCache,
      lastUpdate: response.lastUpdate
    }),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 300000,
    gcTime: 3600000,
    refetchOnWindowFocus: false
  });
};