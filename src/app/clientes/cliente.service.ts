import { Injectable } from '@angular/core';
import { formatDate, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-AR';
//import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
// import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Region } from './region';
//import { AuthService } from '../usuarios/auth.service';

// Despliegue google firebase
import { URL_BACKEND } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint:string = URL_BACKEND + '/api/clientes';

  // El objeto httpHeaders es inmutable, por lo tanto cada vez que agregramos un atributo con el metodo append
  // lo que haace es retornar una nueva instancia con ese cambio.
  // COOMENTADO PORQUE ESTA EL TokenInterceptor
  //private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(private http: HttpClient,
              private router: Router) { }

  // Se agrega este metodo a cada peticion a las rutas protegidas, cada llamada a un endpoint
  // Ya no es necesario porque esta el TokenInterceptor
  // private agregarAuthorizationHeader() {
  //   let token = this.authService.token;
  //   if(token != null) {
  //     return this.httpHeaders.append('Authorization', 'Bearer ' + token);
  //   }
  //   return this.httpHeaders;
  // }

  // BORRAR- AHORA SE MANEJA EN AuthService ------- Tambien se quita el pipe de los metodos
  // public isNoAutorizado(e): boolean{
  //   // No autorizado
  //   if(e.status==401) {
  //
  //     // Si el token expiro en el backend tambien se obtendria 401. Para comprobar por el lado del front tambien
  //     if(this.authService.isAuthenticated()){
  //         this.authService.logout();
  //     }
  //     this.router.navigate(['/login']);
  //     return true;
  //   }
  //
  //   // Acceso prohibido
  //   if(e.status==403) {
  //     swal.fire('Acceso denegado', `El usuario ${this.authService.usuario.username} no tiene acceso a este recurso.`, 'warning');
  //     this.router.navigate(['/clientes']);
  //     return true;
  //   }
  //   return false;
  // }

  getRegiones(): Observable<Region[]> {
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones');
  }



  getClientes(page: number): Observable<any>{
    //return of(CLIENTES);

    //Dentro del cuerpo de la respuesta de la promesa va a devolver un objeto tipo JSON, por defecto sin tipo, tipo any
    // Entonces se hace un cast a <Cliente[]>. Tambien se puede hacer con 'map'
    // return this.http.get<Cliente[]>(this.urlEndPoint);


    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap( (response:any) => {
        // aca se cambia el tipo de dato pero para el log pero despues del return ya no es necesario*
        //let clientes = response as Cliente[];
        console.log("ClienteService: tap 1");
        // content viene del Pageable del back
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        })
      }),

      // Este map cambia el response de Object a tipo Cliente porque hace un return
      map( (response:any) => {
        //let clientes = response as Cliente[];
        // primero return para el map de clientes y el segundo para el map del flujo, del Observable
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();

          let datePipe = new DatePipe('es-AR');
          //cliente.createAt =  datePipe.transform(cliente.createAt, `EEEE dd 'de' MMMM 'del' yyyy`); // 'EEE o EEEE, MMM o  MMMM'
          //Otra manera de cambiar formate de fecha con formatDate, y no con el pipe
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
          return cliente;
        });
        return response;
      // Lo mismo(map) pero sin funcion de flecha
      //map( function(response){ return response as Cliente[] })
    }),
      tap(response => {
        console.log("ClienteService: tap 2");
        // aca el response ya es de tipo cliente por el map anterior
        (response.content as Cliente[]).forEach(cliente => {
          console.log(cliente.nombre);
        })
      })
    )
  };

  // Aca el tipo de dato se maneja con map
  create(cliente: Cliente) : Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente).pipe(
      map( (response:any) => response.cliente as Cliente),
      catchError(e => {

        // Caputura el atributo 'errors' en spring(BAD_REQUEST) para mostrarlo en la plantilla, error validacion de form
        if(e.status==400){
            return throwError(e);
        }
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  };

  getCliente(id: number): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if( e.status != 401 && e.error.mensaje) {
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  // Aca el tipo de dato se maneja con <any>
  update(cliente: Cliente): Observable<any>{
    return this.http.put<any>(this.urlEndPoint, cliente).pipe(
      catchError(e => {

        if(e.status==400){
            return throwError(e);
        }
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    //Tambien puede usarse pasando el id y modificando el controlador en spring para que lo reciba con @PathVariable
    //return this.http.put<Cliente>(`${this.urlEndPoint}/${cliente.id})`, cliente, {headers: this.httpHeaders});
    );
  }

  delete(id:number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    // "archivo" mismo nombre que se le dio en el controlador del back
    formData.append("archivo", archivo);
    formData.append("id", id);

    // Se crea una nueva instancia de httpHeaders porque aca se maneja un form-data y no un tipo application json
    // let httpHeaders = new HttpHeaders();
    // let token = this.authService.token;
    // if(token != null){
    //   // Hay que asignar el valor al httpHeaders ya que es inmutable y crea una nueva instancia
    //   httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token);
    // }

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });
    return this.http.request(req);
    //return this.http.post(`${this.urlEndPoint}/upload`, formData).pipe(

      // Ahora en vez de retornar un Observable Cliente es un HttpEvent con el progreso
      // Despues en detallescomponent se recupera el cliente

    //   .pipe(
    //   map( (response:any) => response.cliente as Cliente),
    //   catchError(e => {
    //     console.error(e.error.mensaje);
    //     swal.fire(e.error.mensaje, e.error.error, 'error');
    //     return throwError(e);
    //   })
    // )
  }

}
