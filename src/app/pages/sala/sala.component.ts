import { Component, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Sala } from '../../model/sala';
import { SalaService } from '../../services/sala.service';
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
import { SalaDialogComponent } from './sala-dialog/sala-dialog.component';

@Component({
  selector: 'app-sala',
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
  templateUrl: './sala.component.html',
  styleUrl: './sala.component.css',
})
export class SalaComponent {
  private readonly salaService = inject(SalaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected $dataSource = signal(new MatTableDataSource<Sala>());
  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);

  protected $salas = this.salaService.$listChange;

  protected displayedColumns: string[] = ['idSala', 'nombre', 'estado', 'actions'];

  constructor() {
    this.salaService.findAll().subscribe(data => this.salaService.setListChange(data));

    this.initializeEffects();
  }

  private initializeEffects(){
    effect( () => {
      const data = this.$salas();
      const p = this.$paginator();
      const s = this.$sort();
      const ds = this.$dataSource();
      
      ds.data = data;
      ds.paginator = p;
      ds.sort = s;
    }); 

    effect(() => {
      const message = this.salaService.$messageChange();
      if(message){
        this.snackBar.open(message, 'INFO', {duration: 2000, horizontalPosition: 'right', verticalPosition: 'top'});
        //esta limpieza no activa el rastreo del effect, no entra a un bucle infinito
        untracked( () => this.salaService.setMessageChange('') );
      }
    });
  }

  openDialog(sala?: Sala){
    this.dialog.open(SalaDialogComponent,{
      width: '650px',
      data: sala,
      // disableClose: true
    });
  }

  delete(idSala: number){
      const ok = window.confirm('Are you sure to delete?');
      if(ok){
        this.salaService.delete(idSala)
        .pipe(
          switchMap( () => this.salaService.findAll() ),
          tap( data => this.salaService.setListChange(data) ),
          tap( () => this.salaService.setMessageChange('DELETED') )
        )
        .subscribe();
      }
    }
  
  applyFilter(e: any){
    const filterValue = e.target.value;
    this.$dataSource().filter = filterValue.trim().toLowerCase();
  }
}
