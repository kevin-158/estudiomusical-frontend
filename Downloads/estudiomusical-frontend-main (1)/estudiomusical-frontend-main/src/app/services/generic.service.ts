import { HttpClient, HttpHeaders } from '@angular/common/http'; // 1. Importa HttpHeaders
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class GenericService<T> {
  protected http = inject(HttpClient);
  protected abstract url: string;


  protected getHeaders() {
    const token = localStorage.getItem('token'); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  findAll() {
    return this.http.get<T[]>(this.url, { headers: this.getHeaders() });
  }

  findById(id: number) {
    return this.http.get<T>(`${this.url}/${id}`, { headers: this.getHeaders() });
  }

  save(t: T) {
    return this.http.post(this.url, t, { headers: this.getHeaders() });
  }

  update(id: number, t: T) {
    return this.http.put(`${this.url}/${id}`, t, { headers: this.getHeaders() });
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`, { headers: this.getHeaders() });
  }
}