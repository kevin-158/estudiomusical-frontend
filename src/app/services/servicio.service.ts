import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Servicio } from '../model/servicio';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ServicioService extends GenericSignalService<Servicio> {
  protected override url: string = `${environment.HOST}/servicios`;
}
