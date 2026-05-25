import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap, tap } from 'rxjs';

// Angular Material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Modelo y Servicio
import { Cliente } from '../../model/cliente';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cliente',
  imports: [
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {
  displayedColumns: string[] = ['idCliente', 'nombre', 'telefono', 'email', 'acciones'];

  // DataSource reactivo usando Signal
  dataSource = signal(new MatTableDataSource<Cliente>());

  // MatPaginator usando el nuevo viewChild reactivo (de Angular 17.1+)
  paginator = viewChild(MatPaginator);

  cliente: Cliente = new Cliente();
  isEditing: boolean = false;

  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);

  // Enlazamos al signal del servicio
  clientes$ = this.clienteService.$listChange;

  constructor() {
    // Primera carga
    this.clienteService.findAll().subscribe(data => this.clienteService.setListChange(data));

    // Efecto para sincronizar el listado y paginador con la tabla
    effect(() => {
      const list = this.clientes$();
      const p = this.paginator();
      const ds = this.dataSource();
      
      ds.data = list;
      ds.paginator = p ?? null;
    });

    // Efecto para escuchar notificaciones de MatSnackBar desde el servicio
    effect(() => {
      const message = this.clienteService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        // Limpiamos el mensaje sin provocar un ciclo infinito usando untracked
        untracked(() => this.clienteService.setMessageChange(''));
      }
    });
  }

  guardar(): void {
    if (this.isEditing) {
      this.clienteService.update(this.cliente.idCliente, this.cliente)
        .pipe(
          switchMap(() => this.clienteService.findAll()),
          tap(data => this.clienteService.setListChange(data)),
          tap(() => this.clienteService.setMessageChange('Cliente actualizado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    } else {
      this.clienteService.save(this.cliente)
        .pipe(
          switchMap(() => this.clienteService.findAll()),
          tap(data => this.clienteService.setListChange(data)),
          tap(() => this.clienteService.setMessageChange('Cliente registrado correctamente ✔'))
        )
        .subscribe(() => {
          this.limpiar();
        });
    }
  }

  editar(cliente: Cliente): void {
    this.cliente = { ...cliente };
    this.isEditing = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clienteService.delete(id)
        .pipe(
          switchMap(() => this.clienteService.findAll()),
          tap(data => this.clienteService.setListChange(data)),
          tap(() => this.clienteService.setMessageChange('Cliente eliminado correctamente ✔'))
        )
        .subscribe();
    }
  }

  limpiar(): void {
    this.cliente = new Cliente();
    this.isEditing = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource().filter = filterValue.trim().toLowerCase();
  }
}
