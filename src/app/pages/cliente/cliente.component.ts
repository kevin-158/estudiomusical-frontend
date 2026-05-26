import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Cliente } from '../../model/cliente';
import { ClienteService } from '../../services/cliente.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-cliente',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterOutlet,
    MatSnackBarModule
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {

  private readonly clienteService = inject(ClienteService);
  private readonly snackBar = inject(MatSnackBar);

  protected $dataSource = signal(new MatTableDataSource<Cliente>());
  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  //@ViewChild(MatPaginator) paginator: MatPaginator;
  //@ViewChild(MatSort) sort: MatSort;

  //Enlaza con el signal del service para que cada vez que haya un cambio, se actualice la tabla
  protected $clientes = this.clienteService.$listChange;

  protected displayedColumns: string[] = ['idCliente', 'nombre', 'telefono', 'email', 'actions'];

  //Esta escuchando los signals de cliente, paginador y sort para actualizar la tabla cada vez que haya un cambio
  constructor() {
    this.clienteService.findAll().subscribe(data => this.clienteService.setListChange(data));

    effect( () => {
      const data = this.$clientes();
      const p = this.$paginator();
      const s = this.$sort();
      const ds = this.$dataSource();
      
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    }); 
    
    effect(() => {
      const message = this.clienteService.$messageChange();
      if(message){
        this.snackBar.open(message, 'INFO', {duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'});
        //esta limpieza no activa el rastreo del effect, no entra a un bucle infinito
        untracked( () => this.clienteService.setMessageChange('') );
      }
    });
  }

  applyFilter(e: any){
    const filterValue = e.target.value;
    this.$dataSource().filter = filterValue.trim().toLowerCase();
  }

  delete(idCliente: number){
    const ok = window.confirm('Are you sure to delete?');
    if(ok){
      this.clienteService.delete(idCliente)
      .pipe(
        switchMap( () => this.clienteService.findAll() ),
        tap( data => this.clienteService.setListChange(data) ),
        tap( () => this.clienteService.setMessageChange('DELETED') )
      )
      .subscribe();
    }
  }
}
