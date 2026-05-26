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

import { Reserva } from '../../model/reserva';
import { ReservaDetalle } from '../../model/reserva-detalle';
import { Cliente } from '../../model/cliente';
import { Sala } from '../../model/sala';
import { Servicio } from '../../model/servicio';

import { ReservaService } from '../../services/reserva.service';
import { ClienteService } from '../../services/cliente.service';
import { SalaService } from '../../services/sala.service';
import { ServicioService } from '../../services/servicio.service';

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
  ],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css',
})
export class ReservaComponent {
  // Lista de reservas registradas para ver al final
  displayedColumnsReserva: string[] = ['idReserva', 'cliente', 'sala', 'fecha', 'total', 'acciones'];
  dataSourceReserva = signal(new MatTableDataSource<Reserva>());
  paginatorReserva = viewChild(MatPaginator);

  // Catálogos cargados del backend
  clientes = signal<Cliente[]>([]);
  salas = signal<Sala[]>([]);
  servicios = signal<Servicio[]>([]);

  // Datos de la reserva actual
  reserva: Reserva = new Reserva();
  detalles = signal<ReservaDetalle[]>([]);

  // Selección temporal de un detalle
  selectedServicio: Servicio | null = null;
  cantidadHoras: number = 1;

  // Servicios inyectados
  private readonly reservaService = inject(ReservaService);
  private readonly clienteService = inject(ClienteService);
  private readonly salaService = inject(SalaService);
  private readonly servicioService = inject(ServicioService);
  private readonly snackBar = inject(MatSnackBar);

  reservas$ = this.reservaService.$listChange;

  constructor() {
    // Cargar catálogos
    this.clienteService.findAll().subscribe(data => this.clientes.set(data));
    this.salaService.findAll().subscribe(data => this.salas.set(data.filter(s => s.estado))); // Solo salas activas
    this.servicioService.findAll().subscribe(data => this.servicios.set(data));

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
    return o1 && o2 ? (o1.idCliente === o2.idCliente || o1.idSala === o2.idSala || o1.idServicio === o2.idServicio) : o1 === o2;
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

    // Resetear formulario de detalle
    this.selectedServicio = null;
    this.cantidadHoras = 1;
  }

  removerDetalle(index: number): void {
    this.detalles.update(current => current.filter((_, i) => i !== index));
    this.recalcularTotal();
  }

  recalcularTotal(): void {
    const totalSum = this.detalles().reduce((sum, det) => sum + det.subtotal, 0);
    this.reserva.total = totalSum;
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
      this.snackBar.open('Por favor, selecciona una fecha y hora ❌', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.detalles().length === 0) {
      this.snackBar.open('Debe agregar al menos un servicio a la reserva ❌', 'Cerrar', { duration: 3000 });
      return;
    }

    // Asignar los detalles al objeto principal
    this.reserva.detalles = this.detalles();

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
    this.detalles.set([]);
    this.selectedServicio = null;
    this.cantidadHoras = 1;
  }
}
