import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Reserva } from '../model/reserva';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService extends GenericSignalService<Reserva> {
  //private url = 'http://localhost:8080/reservas';
  protected override url:string = `${environment.HOST}/reservas`;

  //constructor(private http: HttpClient){}
  //private readonly http = inject(HttpClient);

  // get post put delete
  /*findAll(){
    return this.http.get<Reserva[]>(this.url);
  }*/
}
