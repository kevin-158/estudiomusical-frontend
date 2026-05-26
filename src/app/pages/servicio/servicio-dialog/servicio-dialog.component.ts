import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ServicioService } from '../../../services/servicio.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-servicio-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './servicio-dialog.component.html',
  styleUrl: './servicio-dialog.component.css',
})
export class ServicioDialogComponent {
  private readonly servicioService = inject(ServicioService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ServicioDialogComponent>);

  protected $servicio = signal({ ... this.data });
  
  operate(){
    const servicio = this.$servicio();
    const isEdit = servicio != null && servicio.idServicio > 0;
    const msg = isEdit ? 'UPDATED' : 'CREATED';
    const operation$ = isEdit ? this.servicioService.update(servicio.idServicio, servicio) : this.servicioService.save(servicio); 

    operation$.pipe(
      switchMap(() => this.servicioService.findAll()),
      tap(data => this.servicioService.setListChange(data)),
      tap( () => this.servicioService.setMessageChange(msg))
    )
    .subscribe(() => this.close());
  }

  close(){
    this.dialogRef.close();
  }
}
