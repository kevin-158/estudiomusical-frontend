import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Reserva } from '../../model/reserva';
import { ReservaService } from '../../services/reserva.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservaDialogComponent } from './reserva-dialog/reserva-dialog.component';

@Component({
  selector: 'app-reserva',
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css',
})
export class ReservaComponent {
  private readonly reservaService = inject(ReservaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected $dataSource = signal(new MatTableDataSource<Reserva>());
  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  protected $reservas = this.reservaService.$listChange;

  protected displayedColumns: string[] = ['idReserva', 'cliente', 'sala', 'fecha', 'total', 'actions'];

  constructor() {
    this.reservaService.findAll().subscribe(data => this.reservaService.setListChange(data));

    this.initializeEffects();
  }

  private initializeEffects(){
    effect( () => {
      const data = this.$reservas();
      const p = this.$paginator();
      const s = this.$sort();
      const ds = this.$dataSource();
      
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    }); 

    effect(() => {
      const message = this.reservaService.$messageChange();
      if(message){
        this.snackBar.open(message, 'INFO', {duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'});
        //esta limpieza no activa el rastreo del effect, no entra a un bucle infinito
        untracked( () => this.reservaService.setMessageChange('') );
      }
    });
  }

  openDialog(reserva?: Reserva){
    this.dialog.open(ReservaDialogComponent,{
      width: '750px',
      data: reserva,
      // disableClose: true
    });
  }

  delete(idReserva: number){
      const ok = window.confirm('Are you sure to delete?');
      if(ok){
        this.reservaService.delete(idReserva)
        .pipe(
          switchMap( () => this.reservaService.findAll() ),
          tap( data => this.reservaService.setListChange(data) ),
          tap( () => this.reservaService.setMessageChange('DELETED') )
        )
        .subscribe();
      }
    }
  
  applyFilter(e: any){
    const filterValue = e.target.value;
    this.$dataSource().filter = filterValue.trim().toLowerCase();
  }
}
