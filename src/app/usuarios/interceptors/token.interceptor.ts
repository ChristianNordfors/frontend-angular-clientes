import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService){}

// IMPORTANTE-- El TokenInterceptor se aplica a todas las peticiones http con HttpClient de forma automatica si se esta autenticado

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
      let token = this.authService.token;

      if(token != null ) {
        // El objeto req es inmutable asi que se clona una instancia y se modifica
        const authReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + token)
        });
        console.log('TokenInterceptor => Bearer ' + token);


        // next.handle hace que vaya al siguiente interceptor dentro del stack de interceptor que haya hasta llegar al ultimo
        return next.handle(authReq);
      }

      return next.handle(req);
    }

}
