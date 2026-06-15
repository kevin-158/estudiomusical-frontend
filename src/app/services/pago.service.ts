import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Pago } from '../model/pago';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class PagoService extends GenericSignalService<Pago> {
  protected override url: string = `${environment.HOST}/pagos`;

  findByReserva(idReserva: number) {
    return this.http.get<Pago[]>(`${this.url}/reserva/${idReserva}`);
  }

  registrarPagoReserva(idReserva: number, pago: Pago) {
    return this.http.post<Pago>(`${this.url}/reserva/${idReserva}`, pago);
  }
}
