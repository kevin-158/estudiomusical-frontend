import { Cliente } from './cliente';
import { Sala } from './sala';
import { ReservaDetalle } from './reserva-detalle';

export class Reserva {
  idReserva!: number;
  cliente!: Cliente;
  sala!: Sala;
  fecha!: string;
  total!: number;
  detalles: ReservaDetalle[] = [];
}
