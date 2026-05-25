import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap, tap } from 'rxjs';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Sala } from '../../model/sala';
import { SalaService } from '../../services/sala.service';

@Component({
  selector: 'app-sala',
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './sala.component.html',
  styleUrl: './sala.component.css',
})
export class SalaComponent {
  displayedColumns: string[] = ['idSala', 'nombre', 'estado', 'acciones'];

  // DataSource reactivo usando Signal
  dataSource = signal(new MatTableDataSource<Sala>());

  // MatPaginator usando el nuevo viewChild reactivo
  paginator = viewChild(MatPaginator);

  sala: Sala = new Sala();
  isEditing: boolean = false;

  private readonly salaService = inject(SalaService);
  private readonly snackBar = inject(MatSnackBar);

  // Enlazamos al signal del servicio
  salas$ = this.salaService.$listChange;

  constructor() {
    // Primera carga
    this.salaService.findAll().subscribe(data => this.salaService.setListChange(data));

    // Efecto para sincronizar el listado y paginador con la tabla
    effect(() => {
      const list = this.salas$();
      const p = this.paginator();
      const ds = this.dataSource();
      
      ds.data = list;
      ds.paginator = p ?? null;
    });

    // Efecto para escuchar notificaciones de MatSnackBar desde el servicio
    effect(() => {
      const message = this.salaService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        // Limpiamos el mensaje sin provocar un ciclo infinito usando untracked
        untracked(() => this.salaService.setMessageChange(''));
      }
    });
  }

  guardar(): void {
    if (this.isEditing) {
      this.salaService.update(this.sala.idSala, this.sala)
        .pipe(
          switchMap(() => this.salaService.findAll()),
          tap(data => this.salaService.setListChange(data)),
          tap(() => this.salaService.setMessageChange('Sala actualizada correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    } else {
      this.salaService.save(this.sala)
        .pipe(
          switchMap(() => this.salaService.findAll()),
          tap(data => this.salaService.setListChange(data)),
          tap(() => this.salaService.setMessageChange('Sala registrada correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    }
  }

  editar(sala: Sala): void {
    this.sala = { ...sala };
    this.isEditing = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar esta sala?')) {
      this.salaService.delete(id)
        .pipe(
          switchMap(() => this.salaService.findAll()),
          tap(data => this.salaService.setListChange(data)),
          tap(() => this.salaService.setMessageChange('Sala eliminada correctamente ✔'))
        )
        .subscribe();
    }
  }

  limpiar(): void {
    this.sala = new Sala();
    this.isEditing = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }
}
