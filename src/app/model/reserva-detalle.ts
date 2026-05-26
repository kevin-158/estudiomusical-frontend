import { Servicio } from './servicio';

export class ReservaDetalle {
    idReservaDetalle: number = 0;
    servicio: Servicio = new Servicio();
    cantidadHoras: number = 0;
    subtotal: number = 0;
}
