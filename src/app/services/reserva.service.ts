import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Reserva } from '../model/reserva';
import { GenericSignalService } from './generic-signal.service';

@Injectable({
  providedIn: 'root',
})
export class ReservaService extends GenericSignalService<Reserva> {
  protected override url: string = `${environment.HOST}/reservas`;

  findByFecha(inicio: string, fin: string) {
    const params = new HttpParams().set('inicio', inicio).set('fin', fin);
    return this.http.get<Reserva[]>(`${this.url}/por-fecha`, { params });
  }

  findByCliente(idCliente: number) {
    return this.http.get<Reserva[]>(`${this.url}/cliente/${idCliente}`);
  }

  findBySala(idSala: number) {
    return this.http.get<Reserva[]>(`${this.url}/sala/${idSala}`);
  }

  findByEstado(estado: string) {
    return this.http.get<Reserva[]>(`${this.url}/estado/${estado}`);
  }

  pendientesPago() {
    return this.http.get<Reserva[]>(`${this.url}/pendientes-pago`);
  }

  disponibilidad(salaId: number, fecha: string, horaInicio: string, horaFin: string, excluirReservaId?: number) {
    let params = new HttpParams()
      .set('salaId', salaId)
      .set('fecha', fecha)
      .set('horaInicio', horaInicio)
      .set('horaFin', horaFin);

    if (excluirReservaId) {
      params = params.set('excluirReservaId', excluirReservaId);
    }

    return this.http.get<{ disponible: boolean }>(`${this.url}/disponibilidad`, { params });
  }

  cambiarEstado(idReserva: number, estado: string) {
    const params = new HttpParams().set('estado', estado);
    return this.http.patch<Reserva>(`${this.url}/${idReserva}/estado`, null, { params });
  }

  cancelar(idReserva: number) {
    return this.http.patch<Reserva>(`${this.url}/${idReserva}/cancelar`, null);
  }
}
