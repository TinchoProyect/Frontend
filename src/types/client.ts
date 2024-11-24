export interface ApiMovement {
  codigo: number;
  cod_cli_prov: number;
  tipo_comprobante: number;
  nombre_comprobante: string;
  numero: number;
  fecha: string;
  importe_neto: number;
  fecha_vto: string;
  fecha_comprobante: string;
  importe_total: number;
  comentario: string;
  estado: number;
  efectivo: string | null;
}

export interface ProcessedMovement extends ApiMovement {
  fechaOriginal: string;
  fecha: string;
  monto: number;
  tipo: string;
  efectivo: string;
  saldoAcumulado: number;
}

export interface ApiClienteResponse {
  "Número": number;
  "Nombre": string;
  "Apellido": string;
  "Lista precios": string;
  "Cond. IVA": string;
  "Zona": string;
  "Otros": string;
  "CUIT": string;
  "Vendedor": string | null;
  "Teléfono": string;
  "Teléfono 2": string;
  "E-Mail": string;
  "Celular": string;
  "Límite cta.": number;
  "Nacimiento": string | null;
  "Localidad": string;
  "Provincia": string;
  "País": string;
  "DNI": number;
  "Domicilio": string;
}

export interface ProcessedClientData {
  clienteId: string;
  movimientos: ProcessedMovement[];
  saldoInicial?: SaldoInicial | null;
  fromCache?: boolean;
  lastUpdate?: string;
}

export interface SaldoInicial {
  monto: number;
  fecha: string;
  ultimaModificacion: string;
}

export interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  lastUpdate?: string;
}