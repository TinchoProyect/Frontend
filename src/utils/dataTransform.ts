import { ApiMovement, ProcessedMovement, ProcessedClientData, SaldoInicial } from '../types/client';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const parseDate = (dateString: string): Date => {
  const cleanDate = dateString.split('T')[0];
  return new Date(`${cleanDate}T12:00:00-03:00`);
};

const formatDate = (dateString: string): string => {
  try {
    if (!dateString) {
      throw new Error('Invalid date string');
    }

    const date = parseDate(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date value');
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', { error, dateString });
    return dateString;
  }
};

const getTipoComprobante = (nombre: string): string => {
  const tipos: Record<string, string> = {
    'FA': 'Factura A',
    'FB': 'Factura B',
    'FC': 'Factura C',
    'FE': 'Factura E',
    'RB A': 'Recibo A',
    'RB B': 'Recibo B',
    'NC A': 'Nota de Crédito A',
    'NC B': 'Nota de Crédito B',
    'NC C': 'Nota de Crédito C',
    'NC E': 'Nota de Crédito E',
    'ND A': 'Nota de Débito A',
    'ND B': 'Nota de Débito B',
    'ND C': 'Nota de Débito C',
    'ND E': 'Nota de Débito E',
  };
  return tipos[nombre] || nombre;
};

export const transformMovement = (movement: ApiMovement): ProcessedMovement => {
  const fechaFormateada = formatDate(movement.fecha);
  const tipo = getTipoComprobante(movement.nombre_comprobante);
  
  const esFactura = tipo.includes('Factura');
  const monto = esFactura ? -Math.abs(movement.importe_total) : Math.abs(movement.importe_total);

  return {
    ...movement,
    fecha: fechaFormateada,
    fechaOriginal: movement.fecha,
    monto,
    tipo,
    efectivo: movement.efectivo || 'No especificado',
    saldoAcumulado: 0 // This will be calculated later
  };
};

export const calculateBalances = (
  movements: ProcessedMovement[],
  initialBalance: number = 0
): ProcessedMovement[] => {
  let runningBalance = initialBalance;
  
  const sortedMovements = [...movements].sort((a, b) => {
    try {
      const fechaA = parseDate(a.fechaOriginal);
      const fechaB = parseDate(b.fechaOriginal);
      return fechaA.getTime() - fechaB.getTime();
    } catch {
      return 0;
    }
  });
  
  const movementsWithBalance = sortedMovements.map(mov => {
    runningBalance += mov.monto;
    return { ...mov, saldoAcumulado: runningBalance };
  });
  
  return movementsWithBalance.reverse();
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
    .replace('ARS', '$')
    .trim();
};

export const exportToExcel = async (data: ProcessedClientData): Promise<Blob> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Movimientos');

  // Set columns
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Tipo', key: 'tipo', width: 20 },
    { header: 'Monto', key: 'monto', width: 15 },
    { header: 'Forma de Pago', key: 'efectivo', width: 15 },
    { header: 'Saldo', key: 'saldo', width: 15 }
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add movements
  data.movimientos.forEach((mov) => {
    worksheet.addRow({
      fecha: mov.fecha,
      tipo: mov.tipo,
      monto: formatCurrency(Math.abs(mov.monto)),
      efectivo: mov.tipo.includes('Factura') ? '' : mov.efectivo,
      saldo: formatCurrency(mov.saldoAcumulado)
    });
  });

  // Add saldo inicial if exists
  if (data.saldoInicial) {
    worksheet.addRow([]);
    worksheet.addRow([
      'Saldo Inicial',
      '',
      formatCurrency(data.saldoInicial.Monto), // Ajustado a la clave 'Monto'
      '',
      `(${data.saldoInicial.Fecha})` // Ajustado a la clave 'Fecha'
    ]).font = { italic: true };
  }

  // Generate blob
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
