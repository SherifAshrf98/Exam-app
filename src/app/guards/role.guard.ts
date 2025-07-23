import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    @Inject(LoginService) private loginService: LoginService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const token = this.loginService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    const userRoles = this.loginService.getUserRoles();
    console.log('User roles:', userRoles);

    const requiredRoles: string[] = route.data['roles'] || [];

    if (requiredRoles.length === 0 || requiredRoles.some(role => userRoles.includes(role))) {
      return true;
    }
   
    this.router.navigate(['/']);
    return false;
  }
} 