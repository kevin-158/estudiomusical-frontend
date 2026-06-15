import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { switchMap, tap } from 'rxjs';

// Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Modelo y Servicio
import { Equipo } from '../../model/equipo';
import { EquipoService } from '../../services/equipo.service';

@Component({
  selector: 'app-equipo',
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
  ],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css',
})
export class EquipoComponent {
  displayedColumns: string[] = ['idEquipo', 'nombre', 'marca', 'modelo', 'estado', 'acciones'];

  // DataSource reactivo usando Signal
  dataSource = signal(new MatTableDataSource<Equipo>());

  // MatPaginator usando el nuevo viewChild reactivo
  paginator = viewChild(MatPaginator);

  equipo: Equipo = new Equipo();
  isEditing: boolean = false;

  private readonly equipoService = inject(EquipoService);
  private readonly snackBar = inject(MatSnackBar);

  // Enlazamos al signal del servicio
  equipos$ = this.equipoService.$listChange;

  constructor() {
    // Inicializar el objeto
    this.limpiar();
    
    // Primera carga
    this.equipoService.findAll().subscribe(data => this.equipoService.setListChange(data));

    // Efecto para sincronizar la tabla y el paginador
    effect(() => {
      const list = this.equipos$();
      const p = this.paginator();
      const ds = this.dataSource();
      
      ds.data = list;
      ds.paginator = p ?? null;
    });

    // Efecto para escuchar notificaciones
    effect(() => {
      const message = this.equipoService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        untracked(() => this.equipoService.setMessageChange(''));
      }
    });
  }

  guardar(): void {
    if (this.isEditing) {
      this.equipoService.update(this.equipo.idEquipo, this.equipo)
        .pipe(
          switchMap(() => this.equipoService.findAll()),
          tap(data => this.equipoService.setListChange(data)),
          tap(() => this.equipoService.setMessageChange('Equipo actualizado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    } else {
      this.equipoService.save(this.equipo)
        .pipe(
          switchMap(() => this.equipoService.findAll()),
          tap(data => this.equipoService.setListChange(data)),
          tap(() => this.equipoService.setMessageChange('Equipo registrado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    }
  }

  editar(equipo: Equipo): void {
    this.equipo = { ...equipo };
    this.isEditing = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este equipo técnico?')) {
      this.equipoService.delete(id)
        .pipe(
          switchMap(() => this.equipoService.findAll()),
          tap(data => this.equipoService.setListChange(data)),
          tap(() => this.equipoService.setMessageChange('Equipo eliminado correctamente ✔'))
        )
        .subscribe();
    }
  }

  limpiar(): void {
    this.equipo = new Equipo();
    this.equipo.estado = 'DISPONIBLE'; // Valor por defecto
    this.isEditing = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }
}
