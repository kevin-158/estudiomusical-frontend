import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Servicio } from '../../model/servicio';
import { ServicioService } from '../../services/servicio.service';
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
import { ServicioDialogComponent } from './servicio-dialog/servicio-dialog.component';

@Component({
  selector: 'app-servicio',
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
  templateUrl: './servicio.component.html',
  styleUrl: './servicio.component.css',
})
export class ServicioComponent {
  private readonly servicioService = inject(ServicioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected $dataSource = signal(new MatTableDataSource<Servicio>());
  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  protected $servicios = this.servicioService.$listChange;

  protected displayedColumns: string[] = ['idServicio', 'nombre', 'precioPorHora', 'actions'];

  constructor() {
    this.servicioService.findAll().subscribe(data => this.servicioService.setListChange(data));

    this.initializeEffects();
  }

  private initializeEffects(){
    effect( () => {
      const data = this.$servicios();
      const p = this.$paginator();
      const s = this.$sort();
      const ds = this.$dataSource();
      
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    }); 

    effect(() => {
      const message = this.servicioService.$messageChange();
      if(message){
        this.snackBar.open(message, 'INFO', {duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'});
        //esta limpieza no activa el rastreo del effect, no entra a un bucle infinito
        untracked( () => this.servicioService.setMessageChange('') );
      }
    });
  }

  openDialog(servicio?: Servicio){
    this.dialog.open(ServicioDialogComponent,{
      width: '650px',
      data: servicio,
      // disableClose: true
    });
  }

  delete(idServicio: number){
      const ok = window.confirm('Are you sure to delete?');
      if(ok){
        this.servicioService.delete(idServicio)
        .pipe(
          switchMap( () => this.servicioService.findAll() ),
          tap( data => this.servicioService.setListChange(data) ),
          tap( () => this.servicioService.setMessageChange('DELETED') )
        )
        .subscribe();
      }
    }
  
  applyFilter(e: any){
    const filterValue = e.target.value;
    this.$dataSource().filter = filterValue.trim().toLowerCase();
  }
}
