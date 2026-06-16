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
      { path: '', redirectTo: 'reservas', pathMatch: 'full' },
      { path: 'clientes', component: ClienteComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'INGENIERO'] } },
      { path: 'salas', component: SalaComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'INGENIERO'] } },
      { path: 'servicios', component: ServicioComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'INGENIERO'] } },
      { path: 'reservas', component: ReservaComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'INGENIERO', 'CLIENTE'] } },
      { path: 'equipos', component: EquipoComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'INGENIERO'] } },
      { path: 'reportes', component: ReporteComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
