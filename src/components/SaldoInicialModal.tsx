import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SaldoInicial } from '../types/client';
import { saldoInicialService } from '../services/saldoInicial'; // Asegúrate de importar el servicio correctamente

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saldo: SaldoInicial) => Promise<void>;
  clienteId: string | null; // Permitir null si es necesario
  saldoActual: SaldoInicial | null;
}

const formatearMonto = (valor: number): string => {
  return valor.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatearFecha = (fecha: string): string => {
  return fecha.split('T')[0];
};

export const SaldoInicialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  clienteId,
  saldoActual,
}) => {
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [esNegativo, setEsNegativo] = useState(false);
  const montoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saldoActual) {
      setMonto(formatearMonto(Math.abs(saldoActual.monto)));
      setFecha(formatearFecha(saldoActual.fecha));
      setEsNegativo(saldoActual.monto < 0);
    } else {
      setMonto('');
      setFecha(new Date().toISOString().split('T')[0]);
      setEsNegativo(false);
    }
  }, [saldoActual, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!monto.trim()) {
      setError('Por favor, ingrese un monto');
      return;
    }

    if (!fecha) {
      setError('Por favor, seleccione una fecha');
      return;
    }

    const valorNumerico = parseFloat(monto.replace(/[.,]/g, '')) / 100;
    const montoFinal = esNegativo ? -Math.abs(valorNumerico) : Math.abs(valorNumerico);

    const nuevoSaldo: SaldoInicial = {
      monto: montoFinal,
      fecha: fecha,
      ultimaModificacion: new Date().toISOString(),
    };

    // Agregar console.log para verificar los datos enviados
    console.log('Datos a enviar al servicio guardarSaldoInicial:', {
      clienteId,
      nuevoSaldo
    });

    try {
      const service = new saldoInicialService();
      await service.guardarSaldoInicial(clienteId, nuevoSaldo);

      console.info('Saldo inicial guardado exitosamente:', nuevoSaldo);
      onClose(); // Cerrar el modal después de guardar
    } catch (error) {
      console.error('Error al guardar el saldo inicial:', error);
      setError('No se pudo guardar el saldo inicial. Intente nuevamente.');
    }
  };

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '');
    if (value === '') {
      setMonto('');
      setError('');
      return;
    }

    try {
      const numero = parseFloat(value.replace(/[.,]/g, '')) / 100;
      if (!isNaN(numero)) {
        setMonto(formatearMonto(numero));
        setError('');
      }
    } catch {
      setError('Por favor, ingrese un monto válido');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Establecer Saldo Inicial</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <div className="space-y-2">
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  ref={montoInputRef}
                  type="text"
                  value={monto}
                  onChange={handleMontoChange}
                  className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="montoNegativo"
                  checked={esNegativo}
                  onChange={(e) => setEsNegativo(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="montoNegativo" className="text-sm text-gray-600">
                  Monto negativo
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
