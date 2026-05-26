import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SalaService } from '../../../services/sala.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-sala-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './sala-dialog.component.html',
  styleUrl: './sala-dialog.component.css',
})
export class SalaDialogComponent {
  private readonly salaService = inject(SalaService);
  private readonly data = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SalaDialogComponent>);

  protected $sala = signal({ ... this.data });
  
  operate(){
    const sala = this.$sala();
    const isEdit = sala != null && sala.idSala > 0;
    const msg = isEdit ? 'UPDATED' : 'CREATED';
    const operation$ = isEdit ? this.salaService.update(sala.idSala, sala) : this.salaService.save(sala); 

    operation$.pipe(
      switchMap(() => this.salaService.findAll()),
      tap(data => this.salaService.setListChange(data)),
      tap( () => this.salaService.setMessageChange(msg))
    )
    .subscribe(() => this.close());
  }

  close(){
    this.dialogRef.close();
  }
}
