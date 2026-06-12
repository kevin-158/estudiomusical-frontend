import { Reserva } from './reserva';

export class Pago {
  idPago!: number;
  reserva!: Reserva;
  fechaPago!: string;
  monto!: number;
  metodoPago!: string;
  tipoPago!: string;
}
