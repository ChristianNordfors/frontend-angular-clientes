import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from './usuario';

import { URL_BACKEND } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _usuario: Usuario;
  private _token: string;

  constructor(private http: HttpClient) { }

  public get usuario(): Usuario {
    if(this._usuario != null) {
      return this._usuario;
    } else if(this._usuario == null && sessionStorage.getItem('usuario') != null) {
      // De string se convierte a json y despues se le hace un cast al tipo Usuario
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')) as Usuario;
      return this._usuario;
    }
    // Si no existe retorna el objeto vacio
    return new Usuario();
  }

  public get token(): string {
    if(this._token != null) {
      return this._token;
    } else if(this._token == null && sessionStorage.getItem('token') != null) {
      // No se hace parse porque el token es simplemente un string, no un objeto JSON
      this._token = sessionStorage.getItem('token');
      return this._token;
    }
    // Si no existe..
    return null;
  }



  login(usuario: Usuario): Observable<any> {
    const urlEndpoint = URL_BACKEND + '/oauth/token';

    // btoa() para encriptar
    const credenciales = btoa('angularapp' + ':' + '12345');

    const httpHeaders = new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded',
                                         'Authorization': 'Basic ' + credenciales});

    let params = new URLSearchParams();
    params.set('grant_type','password');
    params.set('username', usuario.username);
    params.set('password', usuario.password);

    return this.http.post<any>(urlEndpoint, params.toString(), {headers: httpHeaders});
  }

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    this._usuario = new Usuario();
    this._usuario.nombre = payload.nombre;
    this._usuario.apellido = payload.apellido;
    this._usuario.email = payload.email;
    this._usuario.username = payload.user_name;
    this._usuario.roles = payload.authorities;
    // sessionStorage objeto global de javascritp, parte del api de html5
    sessionStorage.setItem('usuario', JSON.stringify(this._usuario));
  }

  guardarToken(accessToken: string): void {
    this._token = accessToken;
    sessionStorage.setItem('token', accessToken);
  }

  obtenerDatosToken(accessToken:string): any {
    if(accessToken != null) {
      return JSON.parse(atob(accessToken.split(".")[1]));
    }
    return null;
  }

  isAuthenticated(): boolean {
    // el this.token es el metodo get token para verufucar su está
    let payload = this.obtenerDatosToken(this.token);
    if(payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

  hasRole(role:string): boolean {
    // usuario es el getter. roles es un arreglo y se puede usar el metodo includes para saber si contiene algo
    if(this.usuario.roles.includes(role)){
      return true;
    }
    return false;
  }

  logout():void {
    this._token = null;
    this._usuario = null;
    // Elimina todo
    //sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

}
