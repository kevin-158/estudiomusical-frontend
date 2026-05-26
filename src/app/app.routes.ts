import { Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { SalaComponent } from './pages/sala/sala.component';
import { ServicioComponent } from './pages/servicio/servicio.component';
import { ReservaComponent } from './pages/reserva/reserva.component';

export const routes: Routes = [
  { path: 'clientes', component: ClienteComponent },
  { path: 'salas', component: SalaComponent },
  { path: 'servicios', component: ServicioComponent },
  { path: 'reservas', component: ReservaComponent },
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
];
