import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Servicio } from '../model/servicio';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ServicioService extends GenericSignalService<Servicio> {
  //private url = 'http://localhost:8080/servicios';
  protected override url:string = `${environment.HOST}/servicios`;

  //constructor(private http: HttpClient){}
  //private readonly http = inject(HttpClient);

  // get post put delete
  /*findAll(){
    return this.http.get<Servicio[]>(this.url);
  }*/
}
