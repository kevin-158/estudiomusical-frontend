import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';

import { Reserva } from '../../model/reserva';
import { ReservaDetalle } from '../../model/reserva-detalle';
import { Cliente } from '../../model/cliente';
import { Sala } from '../../model/sala';
import { Servicio } from '../../model/servicio';
import { Equipo } from '../../model/equipo';
import { Pago } from '../../model/pago';

import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { SalaService } from '../../services/sala.service';
import { ServicioService } from '../../services/servicio.service';
import { EquipoService } from '../../services/equipo.service';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-reserva',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatCardModule,
  ],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css',
})
export class ReservaComponent {
  // Lista de reservas registradas para ver al final
  displayedColumnsReserva: string[] = ['idReserva', 'cliente', 'sala', 'fecha', 'horario', 'equipos', 'estado', 'total', 'abono', 'saldo', 'metodoPago', 'acciones'];
  displayedColumnsPago: string[] = ['fechaPago', 'monto', 'metodoPago', 'tipoPago'];
  dataSourceReserva = signal(new MatTableDataSource<Reserva>());
  paginatorReserva = viewChild(MatPaginator);

  // Catálogos cargados del backend
  clientes = signal<Cliente[]>([]);
  salas = signal<Sala[]>([]);
  servicios = signal<Servicio[]>([]);
  equipos = signal<Equipo[]>([]);
  pagosHistorial = signal<Pago[]>([]);

  // Datos de la reserva actual
  reserva: Reserva = new Reserva();
  detalles = signal<ReservaDetalle[]>([]);
  pagoParcial: Pago = new Pago();
  reservaPagoId: number | null = null;
  filtroInicio = '';
  filtroFin = '';
  filtroEstado = 'TODOS';

  // Selección temporal de un detalle
  selectedServicio: Servicio | null = null;
  cantidadHoras: number = 1;

  // Lógica de validación
  selectedDate: Date = new Date();
  hasConflict = signal<boolean>(false);
  abonoInvalido = signal<boolean>(false);

  // Servicios inyectados
  private readonly reservaService = inject(ReservaService);
  private readonly clienteService = inject(ClienteService);
  private readonly salaService = inject(SalaService);
  private readonly servicioService = inject(ServicioService);
  private readonly equipoService = inject(EquipoService);
  private readonly pagoService = inject(PagoService);
  private readonly snackBar = inject(MatSnackBar);

  reservas$ = this.reservaService.$listChange;

  constructor() {
    this.limpiar();
    this.filtroInicio = this.toInputDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    this.filtroFin = this.toInputDate(new Date());

    // Cargar catálogos
    this.clienteService.findAll().subscribe(data => this.clientes.set(data));
    this.salaService.findAll().subscribe(data => this.salas.set(data.filter(s => s.estado))); // Solo salas activas
    this.servicioService.findAll().subscribe(data => this.servicios.set(data));
    this.cargarEquiposDisponibles();

    // Cargar historial de reservas
    this.reservaService.findAll().subscribe(data => this.reservaService.setListChange(data));

    // Efecto para sincronizar la tabla del historial
    effect(() => {
      const list = this.reservas$();
      const p = this.paginatorReserva();
      const ds = this.dataSourceReserva();
      
      ds.data = list;
      ds.paginator = p ?? null;
    });

    // Efecto para mostrar alertas del servicio
    effect(() => {
      const message = this.reservaService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        untracked(() => this.reservaService.setMessageChange(''));
      }
    });
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1 && o2 ? (
      o1.idCliente === o2.idCliente ||
      o1.idSala === o2.idSala ||
      o1.idServicio === o2.idServicio ||
      o1.idEquipo === o2.idEquipo
    ) : o1 === o2;
  }

  onDateChange(date: Date | null): void {
    if (date) {
      this.selectedDate = date;
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60 * 1000));
      const isoString = localDate.toISOString();
      const datePart = isoString.split('T')[0];
      this.reserva.fecha = `${datePart}T${this.reserva.horaInicio || '10:00'}:00`;
      
      this.checkConflict();
      this.cargarEquiposDisponibles();
    }
  }

  onHoraChange(): void {
    const datePart = (this.reserva.fecha || '').split('T')[0] || this.toInputDate(this.selectedDate);
    this.reserva.fecha = `${datePart}T${this.reserva.horaInicio || '10:00'}:00`;
    this.actualizarHoraFin();
    this.checkConflict();
    this.cargarEquiposDisponibles();
  }

  checkConflict(): void {
    if (!this.reserva.sala || !this.reserva.sala.idSala || !this.reserva.fecha) {
      this.hasConflict.set(false);
      return;
    }
    
    const selectedDay = this.reserva.fecha.split('T')[0];
    const selectedSalaId = this.reserva.sala.idSala;
    const selectedStart = this.timeToMinutes(this.reserva.horaInicio || '10:00');
    const selectedEnd = this.timeToMinutes(this.reserva.horaFin || '11:00');
    
    const conflictExist = this.reservas$().some(res => {
      if (!res.fecha || !res.sala || !res.sala.idSala) return false;
      if (res.idReserva === this.reserva.idReserva) return false;
      
      const resDay = res.fecha.split('T')[0];
      const resStart = this.timeToMinutes(res.horaInicio || res.fecha.split('T')[1]?.substring(0, 5) || '10:00');
      const resEnd = this.timeToMinutes(res.horaFin || this.addHours(res.horaInicio || '10:00', 1));
      const overlap = selectedStart < resEnd && selectedEnd > resStart;
      return resDay === selectedDay && res.sala.idSala === selectedSalaId && overlap;
    });
    
    this.hasConflict.set(conflictExist);

    this.validarDisponibilidadBackend();
  }

  onSalaChange(): void {
    this.checkConflict();
  }

  agregarDetalle(): void {
    if (!this.selectedServicio) {
      this.snackBar.open('Por favor, selecciona un servicio ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.cantidadHoras <= 0) {
      this.snackBar.open('Las horas deben ser mayor a cero ❌', 'Cerrar', { duration: 3000 });
      return;
    }

    // Calcular subtotal
    const subtotal = this.selectedServicio.precioPorHora * this.cantidadHoras;

    // Crear el detalle
    const detalle = new ReservaDetalle();
    detalle.servicio = this.selectedServicio;
    detalle.cantidadHoras = this.cantidadHoras;
    detalle.subtotal = subtotal;

    // Actualizar el array local usando Signals
    this.detalles.update(current => [...current, detalle]);

    // Recalcular el total general
    this.recalcularTotal();
    this.actualizarHoraFin();

    // Resetear formulario de detalle
    this.selectedServicio = null;
    this.cantidadHoras = 1;
  }

  removerDetalle(index: number): void {
    this.detalles.update(current => current.filter((_, i) => i !== index));
    this.recalcularTotal();
    this.actualizarHoraFin();
  }

  recalcularTotal(): void {
    const totalSum = this.detalles().reduce((sum, det) => sum + det.subtotal, 0);
    this.reserva.total = totalSum;
    this.calcularSaldo();
  }

  calcularSaldo(): void {
    const total = this.reserva.total || 0;
    const abono = this.reserva.abono || 0;
    
    this.reserva.saldo = total - abono;
    
    // Validación del abono inicial del 50%
    if (total > 0 && abono < (total * 0.5)) {
      this.abonoInvalido.set(true);
    } else {
      this.abonoInvalido.set(false);
    }
  }

  onAbonoChange(): void {
    this.calcularSaldo();
  }

  guardar(): void {
    if (!this.reserva.cliente || !this.reserva.cliente.idCliente) {
      this.snackBar.open('Por favor, selecciona un cliente ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!this.reserva.sala || !this.reserva.sala.idSala) {
      this.snackBar.open('Por favor, selecciona una sala ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (!this.reserva.fecha) {
      this.snackBar.open('Por favor, selecciona una fecha en el calendario ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.detalles().length === 0) {
      this.snackBar.open('Debe agregar al menos un servicio a la reserva ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.abonoInvalido()) {
      this.snackBar.open('El abono inicial debe ser como mínimo el 50% del total ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.hasConflict()) {
      this.snackBar.open('La sala seleccionada ya está ocupada para esta fecha ❌', 'Cerrar', { duration: 3000 });
      return;
    }

    // Asignar los detalles al objeto principal
    this.reserva.detalles = this.detalles();
    this.reserva.fecha = `${this.reserva.fecha.split('T')[0]}T${this.reserva.horaInicio}:00`;

    // Guardar en el backend
    this.reservaService.save(this.reserva)
      .pipe(
        switchMap(() => this.reservaService.findAll()),
        tap(data => this.reservaService.setListChange(data)),
        tap(() => this.reservaService.setMessageChange('Reserva registrada correctamente ✔'))
      )
      .subscribe(() => {
        this.limpiar();
      });
  }

  cargarPagos(idReserva: number): void {
    this.reservaPagoId = idReserva;
    this.pagoService.findByReserva(idReserva).subscribe(data => this.pagosHistorial.set(data));
  }

  registrarPagoParcial(): void {
    if (!this.reservaPagoId) {
      this.snackBar.open('Selecciona una reserva con saldo pendiente', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.pagoParcial.monto || this.pagoParcial.monto <= 0) {
      this.snackBar.open('Ingresa un monto mayor a cero', 'Cerrar', { duration: 3000 });
      return;
    }

    this.pagoParcial.tipoPago = 'PAGO_PARCIAL';
    this.pagoService.registrarPagoReserva(this.reservaPagoId, this.pagoParcial)
      .pipe(
        switchMap(() => this.reservaService.findAll()),
        tap(data => this.reservaService.setListChange(data)),
        tap(() => this.cargarPagos(this.reservaPagoId!)),
        tap(() => this.reservaService.setMessageChange('Pago registrado correctamente'))
      )
      .subscribe(() => {
        this.pagoParcial = new Pago();
        this.pagoParcial.metodoPago = 'EFECTIVO';
      });
  }

  filtrarReservas(): void {
    if (this.filtroEstado !== 'TODOS') {
      this.reservaService.findByEstado(this.filtroEstado).subscribe(data => this.reservaService.setListChange(data));
      return;
    }

    this.reservaService.findByFecha(this.filtroInicio, this.filtroFin).subscribe(data => this.reservaService.setListChange(data));
  }

  cancelar(id: number): void {
    if (confirm('Deseas cancelar esta reserva sin borrar su historial?')) {
      this.reservaService.cancelar(id)
        .pipe(
          switchMap(() => this.reservaService.findAll()),
          tap(data => this.reservaService.setListChange(data)),
          tap(() => this.reservaService.setMessageChange('Reserva cancelada correctamente'))
        )
        .subscribe();
    }
  }

  nombresEquipos(reserva: Reserva): string {
    return reserva.equipos && reserva.equipos.length
      ? reserva.equipos.map(equipo => equipo.nombre).join(', ')
      : 'Sin equipos';
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta reserva?')) {
      this.reservaService.delete(id)
        .pipe(
          switchMap(() => this.reservaService.findAll()),
          tap(data => this.reservaService.setListChange(data)),
          tap(() => this.reservaService.setMessageChange('Reserva eliminada correctamente ✔'))
        )
        .subscribe();
    }
  }

  limpiar(): void {
    this.reserva = new Reserva();
    this.reserva.total = 0;
    this.reserva.abono = 0;
    this.reserva.saldo = 0;
    this.reserva.metodoPago = 'EFECTIVO';
    this.reserva.estado = 'CONFIRMADA';
    this.reserva.horaInicio = '10:00';
    this.reserva.horaFin = '11:00';
    this.reserva.equipos = [];
    this.detalles.set([]);
    this.selectedServicio = null;
    this.cantidadHoras = 1;
    this.selectedDate = new Date();
    
    // Setear fecha de hoy por defecto al limpiar
    const offset = this.selectedDate.getTimezoneOffset();
    const localDate = new Date(this.selectedDate.getTime() - (offset * 60 * 1000));
    this.reserva.fecha = `${localDate.toISOString().split('T')[0]}T${this.reserva.horaInicio}:00`;
    this.pagoParcial = new Pago();
    this.pagoParcial.metodoPago = 'EFECTIVO';
    
    this.hasConflict.set(false);
    this.abonoInvalido.set(false);
  }

  private cargarEquiposDisponibles(): void {
    const fecha = (this.reserva.fecha || '').split('T')[0];
    if (!fecha || !this.reserva.horaInicio || !this.reserva.horaFin) {
      return;
    }

    this.equipoService.disponibles(fecha, this.reserva.horaInicio, this.reserva.horaFin)
      .subscribe({
        next: data => this.equipos.set(data),
        error: () => this.equipoService.findAll().subscribe(data => this.equipos.set(data.filter(e => e.estado === 'DISPONIBLE'))),
      });
  }

  private validarDisponibilidadBackend(): void {
    if (!this.reserva.sala?.idSala || !this.reserva.fecha || !this.reserva.horaInicio || !this.reserva.horaFin) {
      return;
    }

    const fecha = this.reserva.fecha.split('T')[0];
    this.reservaService.disponibilidad(this.reserva.sala.idSala, fecha, this.reserva.horaInicio, this.reserva.horaFin, this.reserva.idReserva)
      .subscribe({
        next: data => this.hasConflict.set(!data.disponible),
        error: () => {},
      });
  }

  private actualizarHoraFin(): void {
    const horas = this.detalles().reduce((sum, det) => sum + (det.cantidadHoras || 0), 0);
    this.reserva.horaFin = this.addHours(this.reserva.horaInicio || '10:00', Math.max(horas, 1));
  }

  private addHours(time: string, hours: number): string {
    const minutes = this.timeToMinutes(time) + hours * 60;
    const normalized = minutes % (24 * 60);
    const hh = Math.floor(normalized / 60).toString().padStart(2, '0');
    const mm = (normalized % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  private toInputDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  }
}
