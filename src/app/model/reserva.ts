import { Cliente } from './cliente';
import { Sala } from './sala';
import { ReservaDetalle } from './reserva-detalle';

export class Reserva {
    idReserva: number = 0;
    cliente: Cliente = new Cliente();
    sala: Sala = new Sala();
    fecha: string = '';
    total: number = 0;
    detalles: ReservaDetalle[] = [];
}
