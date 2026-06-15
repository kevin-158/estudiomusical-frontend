import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Servicio } from '../../model/servicio';
import { ServicioService } from '../../services/servicio.service';

@Component({
  selector: 'app-servicio',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './servicio.component.html',
  styleUrl: './servicio.component.css',
})
export class ServicioComponent {
  displayedColumns: string[] = ['idServicio', 'nombre', 'precioPorHora', 'acciones'];

  dataSource = signal(new MatTableDataSource<Servicio>());
  paginator = viewChild(MatPaginator);

  servicio: Servicio = new Servicio();
  isEditing: boolean = false;

  private readonly servicioService = inject(ServicioService);
  private readonly snackBar = inject(MatSnackBar);

  servicios$ = this.servicioService.$listChange;

  constructor() {
    this.servicioService.findAll().subscribe(data => this.servicioService.setListChange(data));

    effect(() => {
      const list = this.servicios$();
      const p = this.paginator();
      const ds = this.dataSource();
      
      ds.data = list;
      ds.paginator = p ?? null;
    });

    effect(() => {
      const message = this.servicioService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        untracked(() => this.servicioService.setMessageChange(''));
      }
    });
  }

  guardar(): void {
    if (this.isEditing) {
      this.servicioService.update(this.servicio.idServicio, this.servicio)
        .pipe(
          switchMap(() => this.servicioService.findAll()),
          tap(data => this.servicioService.setListChange(data)),
          tap(() => this.servicioService.setMessageChange('Servicio actualizado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    } else {
      this.servicioService.save(this.servicio)
        .pipe(
          switchMap(() => this.servicioService.findAll()),
          tap(data => this.servicioService.setListChange(data)),
          tap(() => this.servicioService.setMessageChange('Servicio registrado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    }
  }

  editar(servicio: Servicio): void {
    this.servicio = { ...servicio };
    this.isEditing = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este servicio?')) {
      this.servicioService.delete(id)
        .pipe(
          switchMap(() => this.servicioService.findAll()),
          tap(data => this.servicioService.setListChange(data)),
          tap(() => this.servicioService.setMessageChange('Servicio eliminado correctamente ✔'))
        )
        .subscribe();
    }
  }

  limpiar(): void {
    this.servicio = new Servicio();
    this.isEditing = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }
}
