import { Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { SalaComponent } from './pages/sala/sala.component';

export const routes: Routes = [
  { path: 'clientes', component: ClienteComponent },
  { path: 'salas', component: SalaComponent },
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
];
