import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Reserva } from '../model/reserva';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService extends GenericSignalService<Reserva> {
  protected override url: string = `${environment.HOST}/reservas`;
}
