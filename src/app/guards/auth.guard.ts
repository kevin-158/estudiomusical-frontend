import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const loginService = inject(LoginService);
  const token = isPlatformBrowser(platformId)
    ? sessionStorage.getItem(environment.TOKEN_NAME)
    : null;

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || loginService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree([loginService.getHomeRoute()]);
};
