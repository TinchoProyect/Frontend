import React from 'react';
import { ProcessedClientData } from '../types/client';
import { FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../utils/dataTransform';

interface Props {
  data: ProcessedClientData;
}

export const ClientDataTable: React.FC<Props> = ({ data }) => {
  const handleDownload = async () => {
    const blob = await exportToExcel(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimientos-cliente-${data.clienteId}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatMonto = (monto: number, isTotal: boolean = false): string => {
    // Round small values to zero
    const roundedMonto = Math.abs(monto) < 0.99 ? 0 : monto;
    
    // For total balance, always use absolute value
    const displayMonto = isTotal ? Math.abs(roundedMonto) : roundedMonto;

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(displayMonto)
      .replace('ARS', '$')
      .trim();
  };

  const formatFechaActual = (): string => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());
  };

  const esFactura = (tipo?: string): boolean => {
    return Boolean(tipo?.includes('Factura'));
  };

  const getMovimientoStyle = (tipo?: string) => {
    const isFactura = esFactura(tipo);
    return {
      text: isFactura ? 'text-emerald-600' : 'text-emerald-900 font-medium',
      bg: isFactura ? 'hover:bg-emerald-50' : 'hover:bg-emerald-50/80',
      base: 'transition-colors duration-150'
    };
  };

  // Get final balance from the most recent movement or saldo inicial
  const saldoActual = data.movimientos?.[0]?.saldoAcumulado ?? data.saldoInicial?.monto ?? 0;

  if (!data.movimientos?.length) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-gray-600">No hay movimientos disponibles para este cliente.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Movimientos del Cliente {data.clienteId}</h2>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-gray-700">Saldo Actual:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatMonto(saldoActual, true)}
                </span>
                <span className="text-sm text-gray-500">(al {formatFechaActual()})</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Descargar Excel
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma de Pago</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.movimientos.map((movimiento, index) => {
              const style = getMovimientoStyle(movimiento.tipo);
              const isFactura = esFactura(movimiento.tipo);

              return (
                <tr key={index} className={`${style.bg} ${style.base} group`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${style.text}`}>
                    {movimiento.fecha}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${style.text}`}>
                    {movimiento.tipo}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${style.text}`}>
                    {formatMonto(Math.abs(movimiento.monto))}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${style.text}`}>
                    {!isFactura ? 
                      (movimiento.efectivo === 'No especificado' ? 'Transferencia' : movimiento.efectivo) 
                      : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {formatMonto(movimiento.saldoAcumulado)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.saldoInicial && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Saldo Inicial:</span>{' '}
            <span>{formatMonto(data.saldoInicial.monto)}</span>
            <span className="text-gray-500 ml-2">({data.saldoInicial.fecha})</span>
          </p>
        </div>
      )}
    </div>
  );
};