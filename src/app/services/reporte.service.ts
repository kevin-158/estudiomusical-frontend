import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ClienteFrecuente, EquipoUsado, IngresoPorFecha, OcupacionSala, PagoPendiente, ReporteResumen, ReservasPorFecha, ServicioSolicitado } from '../model/reporte';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.HOST}/reportes`;

  resumen(inicio: string, fin: string) {
    return this.http.get<ReporteResumen>(`${this.url}/resumen`, { params: this.params(inicio, fin) });
  }

  ingresos(inicio: string, fin: string) {
    return this.http.get<IngresoPorFecha[]>(`${this.url}/ingresos`, { params: this.params(inicio, fin) });
  }

  reservas(inicio: string, fin: string) {
    return this.http.get<ReservasPorFecha[]>(`${this.url}/reservas`, { params: this.params(inicio, fin) });
  }

  pagosPendientes() {
    return this.http.get<PagoPendiente[]>(`${this.url}/pagos-pendientes`);
  }

  serviciosMasSolicitados(inicio: string, fin: string) {
    return this.http.get<ServicioSolicitado[]>(`${this.url}/servicios-mas-solicitados`, { params: this.params(inicio, fin) });
  }

  ocupacionSalas(inicio: string, fin: string) {
    return this.http.get<OcupacionSala[]>(`${this.url}/ocupacion-salas`, { params: this.params(inicio, fin) });
  }

  ingresosPorServicio(inicio: string, fin: string) {
    return this.http.get<ServicioSolicitado[]>(`${this.url}/ingresos-por-servicio`, { params: this.params(inicio, fin) });
  }

  clientesFrecuentes(inicio: string, fin: string) {
    return this.http.get<ClienteFrecuente[]>(`${this.url}/clientes-frecuentes`, { params: this.params(inicio, fin) });
  }

  equiposMasUsados(inicio: string, fin: string) {
    return this.http.get<EquipoUsado[]>(`${this.url}/equipos-mas-usados`, { params: this.params(inicio, fin) });
  }

  private params(inicio: string, fin: string) {
    return new HttpParams().set('inicio', inicio).set('fin', fin);
  }
}
