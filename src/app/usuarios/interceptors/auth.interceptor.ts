import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth.service';
import swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService,
              private router: Router){}

// IMPORTANTE-- El TokenInterceptor se aplica a todas las peticiones http con HttpClient de forma automatica si se esta autenticado

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {

      // Aca se maneja la respuesta, el response,(en el anterior se maneja el request) cuando se reciben los codigos 401 y 403
      return next.handle(req).pipe(
        catchError(e => {
          // No autenticado
          if(e.status==401) {

            // Si el token expiro en el backend tambien se obtendria 401. Para comprobar por el lado del front tambien
            if(this.authService.isAuthenticated()){
                this.authService.logout();
            }
            this.router.navigate(['/login']);
          }
          // Acceso prohibido, no tiene los permisos
          if(e.status==403) {
            swal.fire('Acceso denegado', `El usuario ${this.authService.usuario.username} no tiene acceso a este recurso.`, 'warning');
            this.router.navigate(['/clientes']);
          }
          // if(e.status==500) {
          //   swal.fire('Datos incorrectos', e.error.error, 'warning');
          // }
          return throwError(e);
        })
      );
    }

}
