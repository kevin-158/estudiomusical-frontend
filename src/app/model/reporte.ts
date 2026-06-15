export interface ReporteResumen {
  totalReservas: number;
  totalClientes: number;
  ingresos: number;
  saldosPendientes: number;
}

export interface IngresoPorFecha {
  fecha: string;
  total: number;
}

export interface ReservasPorFecha {
  fecha: string;
  cantidad: number;
}

export interface PagoPendiente {
  idReserva: number;
  cliente: string;
  sala: string;
  fecha: string;
  total: number;
  abonado: number;
  saldo: number;
}

export interface ServicioSolicitado {
  idServicio: number;
  servicio: string;
  cantidadReservas: number;
  horasVendidas: number;
  totalGenerado: number;
}

export interface OcupacionSala {
  idSala: number;
  sala: string;
  reservas: number;
  horasOcupadas: number;
}

export interface ClienteFrecuente {
  idCliente: number;
  cliente: string;
  reservas: number;
  totalGastado: number;
}

export interface EquipoUsado {
  idEquipo: number;
  equipo: string;
  reservas: number;
}
