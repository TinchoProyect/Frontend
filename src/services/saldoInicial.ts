import { SaldoInicial } from '../types/client';
import axios from 'axios';

export class saldoInicialService {
  private baseUrl = 'http://1.tcp.sa.ngrok.io:20186/saldos-iniciales'; // Dirección actualizada

  async guardarSaldoInicial(clienteId: string, saldo: SaldoInicial): Promise<void> {
    if (!clienteId) {
      throw new Error('ID de cliente no válido');
    }

    try {
      // Enviar clienteId dentro del cuerpo
      await axios.post(this.baseUrl, {
        IDCliente: clienteId, // Cambiar a este formato
        Monto: saldo.monto, // Actualizado para coincidir con las claves del backend
        Fecha: saldo.fecha, // Actualizado para coincidir con las claves del backend
        UltimaModificacion: new Date().toISOString() // Actualizado para coincidir con las claves del backend
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
        monto: data.Monto, // Actualizado para coincidir con las claves del backend
        fecha: data.Fecha, // Actualizado para coincidir con las claves del backend
        ultimaModificacion: data.UltimaModificacion // Actualizado para coincidir con las claves del backend
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
