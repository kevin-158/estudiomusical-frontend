import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
  // Columnas de la tabla
  displayedColumns: string[] = ['idCliente', 'nombre', 'telefono', 'email', 'acciones'];

  // DataSource para mat-table
  dataSource = new MatTableDataSource<Cliente>();

  // Paginator
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Modelo del formulario
  cliente: Cliente = new Cliente();

  // Modo edición
  isEditing: boolean = false;

  // Inyección al estilo del profesor
  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.listar();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  listar(): void {
    this.clienteService.findAll().subscribe(data => (this.dataSource.data = data));
  }

  guardar(): void {
    if (this.isEditing) {
      this.clienteService.update(this.cliente.idCliente, this.cliente).subscribe(() => {
        this.snackBar.open('Cliente actualizado correctamente ✔', 'Cerrar', { duration: 3000 });
        this.limpiar();
        this.listar();
      });
    } else {
      this.clienteService.save(this.cliente).subscribe(() => {
        this.snackBar.open('Cliente registrado correctamente ✔', 'Cerrar', { duration: 3000 });
        this.limpiar();
        this.listar();
      });
    }
  }

  editar(cliente: Cliente): void {
    this.cliente = { ...cliente };
    this.isEditing = true;
  }

  eliminar(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clienteService.delete(id).subscribe(() => {
        this.snackBar.open('Cliente eliminado correctamente ✔', 'Cerrar', { duration: 3000 });
        this.listar();
      });
    }
  }

  limpiar(): void {
    this.cliente = new Cliente();
    this.isEditing = false;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
