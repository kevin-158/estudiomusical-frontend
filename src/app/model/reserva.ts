import { Cliente } from './cliente';
import { Equipo } from './equipo';
import { Sala } from './sala';
import { ReservaDetalle } from './reserva-detalle';

export class Reserva {
  idReserva!: number;
  cliente!: Cliente;
  sala!: Sala;
  fecha!: string;
  horaInicio: string = '10:00';
  horaFin: string = '11:00';
  total!: number;
  abono: number = 0;
  saldo: number = 0;
  metodoPago: string = 'EFECTIVO';
  estado: string = 'CONFIRMADA';
  detalles: ReservaDetalle[] = [];
  equipos: Equipo[] = [];
}
