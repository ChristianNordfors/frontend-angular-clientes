import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      // Primero verifica si esta autenticado asi el resto no se ejecuta, ya que si no esta autenticado no hay ROL
      if(!this.authService.isAuthenticated()){
        this.router.navigate(['/login']);
        return false;
      }

      let role = next.data['role'] as string;
      console.log(role);

      if(this.authService.hasRole(role)){
        return true;
      }

      swal.fire('Acceso denegado', `El usuario ${this.authService.usuario.username} no tiene acceso a este recurso.`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
  }

}
