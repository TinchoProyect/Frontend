import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useClientes } from '../hooks/useClientes';
import { ClienteFormateado } from '../types/client';
import { useConnectionStatus } from '../hooks/useConnectionStatus';

interface Props {
  onClienteSelect: (clienteId: string) => void;
  disabled?: boolean;
}

export const ClienteSearch: React.FC<Props> = ({ onClienteSelect, disabled }) => {
  const [busqueda, setBusqueda] = useState('');
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, error, isError, refetch } = useClientes();
  const { isConnected } = useConnectionStatus();

  useEffect(() => {
    if (isConnected) {
      refetch();
    }
  }, [isConnected, refetch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clientesFiltrados = data?.clientes.filter(cliente =>
    cliente.label.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.numeroFormateado.includes(busqueda) ||
    cliente.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setMostrarDropdown(true);
  };

  const handleClienteSelect = (cliente: ClienteFormateado) => {
    setBusqueda(cliente.label);
    onClienteSelect(cliente.id);
    setMostrarDropdown(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={busqueda}
          onChange={handleInputChange}
          onFocus={() => setMostrarDropdown(true)}
          placeholder="Buscar por número o nombre de cliente..."
          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors duration-200
            ${isError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          disabled={disabled || isLoading}
          ref={inputRef}
        />
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {!isConnected && data?.fromCache && (
        <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
          <Clock className="w-3 h-3" />
          <span>Usando datos almacenados localmente ({data.lastUpdate})</span>
        </div>
      )}

      {isError && error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error instanceof Error ? error.message : 'Error al cargar los clientes'}</span>
        </div>
      )}

      {mostrarDropdown && !isError && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-auto">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente) => (
              <button
                key={cliente.id}
                onClick={() => handleClienteSelect(cliente)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150"
              >
                <span className="font-medium">{cliente.numeroFormateado}</span>
                <span className="text-gray-600"> - {cliente.nombreCompleto}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando clientes...</span>
                </div>
              ) : (
                'No se encontraron clientes'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};