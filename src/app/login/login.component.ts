import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { environment } from '../../environments/environment.development';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  readonly isLoggingIn = signal(false);
  readonly loginError = signal(false);

  readonly loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  login() {
    if (this.loginForm.invalid || this.isLoggingIn()) {
      return;
    }

    this.isLoggingIn.set(true);
    this.loginError.set(false);

    const username = this.loginForm.value.username ?? '';
    const password = this.loginForm.value.password ?? '';

    this.loginService.login(username, password).subscribe({
      next: data => {
        sessionStorage.setItem(environment.TOKEN_NAME, data.access_token);
        this.router.navigate([this.loginService.getHomeRoute()]);
      },
      error: () => {
        this.loginError.set(true);
        this.isLoggingIn.set(false);
      },
      complete: () => this.isLoggingIn.set(false),
    });
  }
}
