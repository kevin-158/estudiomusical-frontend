import { Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { SalaComponent } from './pages/sala/sala.component';
import { ServicioComponent } from './pages/servicio/servicio.component';
import { ReservaComponent } from './pages/reserva/reserva.component';
import { ClienteEditComponent } from './pages/cliente/cliente-edit/cliente-edit.component';

export const routes: Routes = [
    { 
        path: 'pages/cliente', component: ClienteComponent,
        children: [
            { path: 'new', component: ClienteEditComponent },
            { path: 'edit/:id', component: ClienteEditComponent },
        ],
    },
    { path: 'pages/sala', component: SalaComponent },
    { path: 'pages/servicio', component: ServicioComponent },
    { path: 'pages/reserva', component: ReservaComponent }
];
