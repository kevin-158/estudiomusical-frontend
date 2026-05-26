import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cliente } from '../../../model/cliente';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-cliente-edit',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './cliente-edit.component.html',
  styleUrl: './cliente-edit.component.css',
})
export class ClienteEditComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);

  protected $form = signal(new FormGroup({
    idCliente: new FormControl<number | null>(null),
    nombre: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
    telefono: new FormControl<string>('',[Validators.required, Validators.minLength(7), Validators.maxLength(20)]),
    email: new FormControl<string>('',[Validators.required, Validators.email]),
  }));

  private readonly $params = toSignal(this.route.params, { initialValue: {} });
  protected $id = computed(() => this.$params()['id']);
  protected $isEdit = computed(() => !!this.$id()); //En JS es como decir !! ¿Existe realmente este dato?, devuelve true o false
  protected $f = computed(() => this.$form().controls);

  constructor() {
    effect(() => {
      const id = this.$id();
      if(id){
        this.clienteService.findById(id).subscribe(data => this.$form().patchValue(data));
      }
    });
  }

  /*ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('ID:', id);
    });
  }*/

  operate(){
    const form = this.$form();
    const isEdit = this.$isEdit();
    const id = this.$id();

    if(form.invalid) return;

    const cliente: Cliente = form.value as Cliente;
    /*const cliente: Cliente = new Cliente();
    cliente.idCliente = form.value.idCliente;
    cliente.nombre = form.value.nombre;
    cliente.telefono = form.value.telefono;
    cliente.email = form.value.email;*/

    const operation$ = isEdit ? this.clienteService.update(id, cliente) : this.clienteService.save(cliente);

    operation$.pipe(
      switchMap(() => this.clienteService.findAll()),
      tap(data => this.clienteService.setListChange(data)),
      tap(() => this.clienteService.setMessageChange(isEdit ? 'UPDATED' : 'CREATED'))
    )
    .subscribe(() => {
      this.router.navigate(['/pages/cliente']);
    });
  }
}
