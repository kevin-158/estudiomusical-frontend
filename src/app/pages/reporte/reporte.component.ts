import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ClienteFrecuente, EquipoUsado, IngresoPorFecha, OcupacionSala, PagoPendiente, ReporteResumen, ReservasPorFecha, ServicioSolicitado } from '../../model/reporte';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './reporte.component.html',
  styleUrl: './reporte.component.css',
})
export class ReporteComponent {
  private readonly reporteService = inject(ReporteService);

  inicio = '';
  fin = '';
  resumen = signal<ReporteResumen>({ totalReservas: 0, totalClientes: 0, ingresos: 0, saldosPendientes: 0 });
  ingresos = signal<IngresoPorFecha[]>([]);
  reservas = signal<ReservasPorFecha[]>([]);
  pagosPendientes = signal<PagoPendiente[]>([]);
  servicios = signal<ServicioSolicitado[]>([]);
  ocupacionSalas = signal<OcupacionSala[]>([]);
  clientesFrecuentes = signal<ClienteFrecuente[]>([]);
  equiposMasUsados = signal<EquipoUsado[]>([]);

  columnasIngresos = ['fecha', 'total'];
  columnasReservas = ['fecha', 'cantidad'];
  columnasPendientes = ['idReserva', 'cliente', 'sala', 'fecha', 'saldo'];
  columnasServicios = ['servicio', 'cantidadReservas', 'horasVendidas', 'totalGenerado'];
  columnasOcupacion = ['sala', 'reservas', 'horasOcupadas'];
  columnasClientes = ['cliente', 'reservas', 'totalGastado'];
  columnasEquipos = ['equipo', 'reservas'];

  constructor() {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.inicio = this.toInputDate(primerDia);
    this.fin = this.toInputDate(hoy);
    this.cargar();
  }

  cargar(): void {
    this.reporteService.resumen(this.inicio, this.fin).subscribe(data => this.resumen.set(data));
    this.reporteService.ingresos(this.inicio, this.fin).subscribe(data => this.ingresos.set(data));
    this.reporteService.reservas(this.inicio, this.fin).subscribe(data => this.reservas.set(data));
    this.reporteService.pagosPendientes().subscribe(data => this.pagosPendientes.set(data));
    this.reporteService.serviciosMasSolicitados(this.inicio, this.fin).subscribe(data => this.servicios.set(data));
    this.reporteService.ocupacionSalas(this.inicio, this.fin).subscribe(data => this.ocupacionSalas.set(data));
    this.reporteService.clientesFrecuentes(this.inicio, this.fin).subscribe(data => this.clientesFrecuentes.set(data));
    this.reporteService.equiposMasUsados(this.inicio, this.fin).subscribe(data => this.equiposMasUsados.set(data));
  }

  private toInputDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }
}
