import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Sala } from '../model/sala';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class SalaService extends GenericSignalService<Sala> {
  protected override url: string = `${environment.HOST}/salas`;
}
