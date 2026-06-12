import { Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { SalaComponent } from './pages/sala/sala.component';
import { ServicioComponent } from './pages/servicio/servicio.component';
import { ReservaComponent } from './pages/reserva/reserva.component';
import { EquipoComponent } from './pages/equipo/equipo.component';
import { ReporteComponent } from './pages/reporte/reporte.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'pages',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
      { path: 'clientes', component: ClienteComponent },
      { path: 'salas', component: SalaComponent },
      { path: 'servicios', component: ServicioComponent },
      { path: 'reservas', component: ReservaComponent },
      { path: 'equipos', component: EquipoComponent },
      { path: 'reportes', component: ReporteComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
