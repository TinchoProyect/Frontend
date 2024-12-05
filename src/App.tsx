import React, { useState, useCallback } from 'react';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ClientDataTable } from './components/ClientDataTable';
import { ClienteSearch } from './components/ClienteSearch';
import { ConnectionStatus } from './components/ConnectionStatus';
import { AlertCircle, FileText, Wallet } from 'lucide-react';
import { SaldoInicial } from './types/client';
import { saldoInicialService } from './services/saldoInicial';
import { SaldoInicialModal } from './components/SaldoInicialModal';
import { useClientData } from './hooks/useClientData';
import Logo from './components/Logo';

const saldoService = new saldoInicialService();

function App() {
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [modalSaldoInicial, setModalSaldoInicial] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const { 
    data: clientData,
    isLoading,
    error,
    refetch
  } = useClientData(clienteId, shouldFetchData);

  const handleClienteSelect = useCallback((id: string) => {
    setClienteId(id || null);
    setShouldFetchData(false); // Detenemos la búsqueda hasta que se haga explícitamente
  }, []);

  const handleConsultarMovimientos = useCallback(() => {
    if (!clienteId) return;
    setShouldFetchData(true); // Activamos la consulta de datos
    refetch(); // Refrescamos los datos
  }, [clienteId, refetch]);

  const handleSaldoInicialSave = useCallback(async (saldo: SaldoInicial) => {
    try {
      if (!clienteId) {
        throw new Error('No hay cliente seleccionado');
      }

      await saldoService.guardarSaldoInicial(clienteId, saldo); // Guardamos el saldo inicial
      if (shouldFetchData) {
        refetch(); // Actualizamos la tabla si corresponde
      }

      console.info('Saldo inicial guardado:', {
        clienteId,
        saldo
      });
    } catch (error) {
      console.error('Error al guardar saldo inicial:', error);
      alert('Error al guardar el saldo inicial. Por favor, intente nuevamente.');
    }
  }, [clienteId, refetch, shouldFetchData]);

  const handleModalClose = useCallback(() => {
    setModalSaldoInicial(false); // Cerramos el modal
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="inline-block mb-12 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <Logo />
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
              <ConnectionStatus 
                lastUpdate={clientData?.lastUpdate}
                clienteLastUpdate={clientData?.lastUpdate}
                showClientUpdate={Boolean(clientData)}
              />
            </div>
            
            <div className="space-y-6">
              <ClienteSearch 
                onClienteSelect={handleClienteSelect}
                disabled={isLoading} // Desactivamos la búsqueda si está cargando
              />

              {clienteId && (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setModalSaldoInicial(true)} // Abrir modal de saldo inicial
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2 text-sm"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Establecer saldo inicial</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConsultarMovimientos} // Consultar movimientos del cliente
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner />
                        <span>Consultando...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Consultar Movimientos</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-4">
                  <LoadingSpinner />
                  <p className="mt-2 text-gray-600">
                    Consultando movimientos del cliente {clienteId}...
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-700">
                      {error instanceof Error ? error.message : 'Error al obtener datos del cliente.'}
                    </p>
                  </div>
                </div>
              )}

              {shouldFetchData && clientData && <ClientDataTable data={clientData} />}
            </div>
          </div>
        </div>
      </div>

      <SaldoInicialModal
        isOpen={modalSaldoInicial}
        onClose={handleModalClose}
        onSave={handleSaldoInicialSave}
        clienteId={clienteId} // Garantizamos que clienteId sea string
        saldoActual={clientData?.saldoInicial || null} // Validamos saldo inicial
      />
    </div>
  );
}

export default App;
