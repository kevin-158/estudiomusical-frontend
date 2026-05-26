import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Cliente } from '../model/cliente';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteService extends GenericSignalService<Cliente> {
  protected override url: string = `${environment.HOST}/clientes`;
}
