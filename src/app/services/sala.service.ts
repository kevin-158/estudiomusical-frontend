import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Sala } from '../model/sala';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class SalaService extends GenericSignalService<Sala> {
  //private url = 'http://localhost:8080/salas';
  protected override url:string = `${environment.HOST}/salas`;

  //constructor(private http: HttpClient){}
  //private readonly http = inject(HttpClient);

  // get post put delete
  /*findAll(){
    return this.http.get<Sala[]>(this.url);
  }*/
}
