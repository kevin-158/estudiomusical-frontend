import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-layout',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLinkActive,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  readonly menuItems = [
    { label: 'Clientes', icon: 'people', route: '/pages/clientes', roles: ['ADMIN', 'INGENIERO'] },
    { label: 'Salas', icon: 'meeting_room', route: '/pages/salas', roles: ['ADMIN', 'INGENIERO'] },
    { label: 'Servicios', icon: 'music_note', route: '/pages/servicios', roles: ['ADMIN', 'INGENIERO'] },
    { label: 'Reservas', icon: 'event', route: '/pages/reservas', roles: ['ADMIN', 'INGENIERO', 'CLIENTE'] },
    { label: 'Equipos Tecnicos', icon: 'mic', route: '/pages/equipos', roles: ['ADMIN', 'INGENIERO'] },
    { label: 'Reportes', icon: 'dashboard', route: '/pages/reportes', roles: ['ADMIN'] },
  ];

  readonly currentRoles = this.loginService.getRoles();

  canShow(roles: string[]) {
    return this.loginService.hasAnyRole(roles);
  }

  logout() {
    this.loginService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
