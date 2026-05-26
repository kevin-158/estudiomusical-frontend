import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { ReservaService } from '../../../services/reserva.service';
import { ClienteService } from '../../../services/cliente.service';
import { SalaService } from '../../../services/sala.service';
import { ServicioService } from '../../../services/servicio.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { ReservaDetalle } from '../../../model/reserva-detalle';
import { Servicio } from '../../../model/servicio';

@Component({
  selector: 'app-reserva-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './reserva-dialog.component.html',
  styleUrl: './reserva-dialog.component.css',
})
export class ReservaDialogComponent {
  private readonly reservaService = inject(ReservaService);
  private readonly clienteService = inject(ClienteService);
  private readonly salaService = inject(SalaService);
  private readonly servicioService = inject(ServicioService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ReservaDialogComponent>);

  protected $reserva = signal({ ...this.data, detalles: this.data?.detalles ?? [] });

  protected $clientes = toSignal(this.clienteService.findAll(), { initialValue: [] });
  protected $salas = toSignal(this.salaService.findAll(), { initialValue: [] });
  protected $servicios = toSignal(this.servicioService.findAll(), { initialValue: [] });

  addDetalle(){
    const detalles = [...this.$reserva().detalles, { servicio: null, cantidadHoras: 1, subtotal: 0 }];
    this.$reserva.update(r => ({ ...r, detalles }));
  }

  removeDetalle(index: number){
    const detalles = this.$reserva().detalles.filter((_: any, i: number) => i !== index);
    this.$reserva.update(r => ({ ...r, detalles }));
    this.calcularTotal();
  }

  calcularSubtotal(index: number){
    const detalles = [...this.$reserva().detalles];
    const d = detalles[index];
    if(d.servicio && d.cantidadHoras){
      d.subtotal = d.servicio.precioPorHora * d.cantidadHoras;
    }
    this.$reserva.update(r => ({ ...r, detalles }));
    this.calcularTotal();
  }

  calcularTotal(){
    const total = this.$reserva().detalles.reduce((acc: number, d: any) => acc + (d.subtotal || 0), 0);
    this.$reserva.update(r => ({ ...r, total }));
  }

  operate(){
    const reserva = this.$reserva();
    const isEdit = reserva != null && reserva.idReserva > 0;
    const msg = isEdit ? 'UPDATED' : 'CREATED';
    const operation$ = isEdit ? this.reservaService.update(reserva.idReserva, reserva) : this.reservaService.save(reserva);

    operation$.pipe(
      switchMap(() => this.reservaService.findAll()),
      tap(data => this.reservaService.setListChange(data)),
      tap(() => this.reservaService.setMessageChange(msg))
    )
    .subscribe(() => this.close());
  }

  compareById(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.idCliente === o2.idCliente || o1.idSala === o2.idSala || o1.idServicio === o2.idServicio : o1 === o2;
  }

  close(){
    this.dialogRef.close();
  }
}

// Añadir fuera de la clase (antes del cierre)
