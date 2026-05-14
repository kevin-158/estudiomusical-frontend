import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cliente } from '../model/cliente';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  //private url = 'http://localhost:9090/clientes';
  private url: string = `${environment.HOST}/clientes`;

  //constructor(private http: HttpClient){}
  private readonly http = inject(HttpClient);

  // get post put delete
  findAll() {
    return this.http.get<Cliente[]>(this.url);
  }

  findById(id: number) {
    return this.http.get<Cliente>(`${this.url}/${id}`);
  }

  save(cliente: Cliente) {
    return this.http.post<Cliente>(this.url, cliente);
  }

  update(id: number, cliente: Cliente) {
    return this.http.put<Cliente>(`${this.url}/${id}`, cliente);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
