import { inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const token = isPlatformBrowser(platformId)
    ? sessionStorage.getItem(environment.TOKEN_NAME)
    : null;

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
