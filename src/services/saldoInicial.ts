import { SaldoInicial } from '../types/client';
import axios from 'axios';

export class saldoInicialService {
  private baseUrl = '/api/saldos';

  async guardarSaldoInicial(clienteId: string, saldo: SaldoInicial): Promise<void> {
    if (!clienteId) {
      throw new Error('ID de cliente no válido');
    }

    try {
      await axios.post(`${this.baseUrl}/${clienteId}`, {
        monto: saldo.monto,
        fecha: saldo.fecha,
        ultimaModificacion: new Date().toISOString()
      });

      console.info('Saldo inicial guardado:', {
        clienteId,
        monto: saldo.monto,
        fecha: saldo.fecha
      });
    } catch (error) {
      console.error('Error guardando saldo inicial:', error);
      throw new Error('Error al guardar el saldo inicial');
    }
  }

  async obtenerSaldoInicial(clienteId: string): Promise<SaldoInicial | null> {
    if (!clienteId) return null;

    try {
      const response = await axios.get(`${this.baseUrl}/${clienteId}`);
      const data = response.data;

      if (!data) {
        return null;
      }

      return {
        monto: data.monto,
        fecha: data.fecha,
        ultimaModificacion: data.ultimaModificacion
      };
    } catch (error) {
      console.error('Error obteniendo saldo inicial:', error);
      return null;
    }
  }

  async eliminarSaldoInicial(clienteId: string): Promise<void> {
    if (!clienteId) return;
    
    try {
      await axios.delete(`${this.baseUrl}/${clienteId}`);
      console.info('Saldo inicial eliminado:', { clienteId });
    } catch (error) {
      console.error('Error eliminando saldo inicial:', error);
      throw new Error('Error al eliminar el saldo inicial');
    }
  }
}