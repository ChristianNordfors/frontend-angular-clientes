import { Component, OnInit, Input, Output } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import Swal from 'sweetalert2';
import {tap} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalService } from './detalle/modal.service';
import { AuthService } from '../usuarios/auth.service';

import { URL_BACKEND } from '../config/config';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styles: [
  ]
})
export class ClientesComponent implements OnInit {

  clientes: Cliente[];
  paginator: any;
  //Se inyecta en la clase clientes.component.html, en <detalle-cliente>
  clienteSeleccionado:Cliente;

  urlBackend: string = URL_BACKEND;

  private urlEndPoint:string = 'http://localhost:8080/api/clientes';

  constructor(private clienteService: ClienteService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              public modalService: ModalService,
              public authService: AuthService) { }

  ngOnInit(): void {
    // this.clienteService.getClientes().subscribe(
    //   function (clientes) {
    //     this.clientes = clientes
    //   }
    // );

    // Forma simplificada con funcion de flecha
    // Se susccribe al Observable para manejars siempre dentro de la misma instancia del OnInit, al cambiar de paginas
    this.activatedRoute.paramMap.subscribe ( params => {
      // Se convierte el parametros page a number ya que por defecto viene como string
      let page: number = +params.get('page');

      if(!page){
        page = 0;
      }
      this.router.navigate(['./clientes/page', page]);
      this.clienteService.getClientes(page).pipe(
        // El tap no retorna nada, es un void
       //  tap(response => {
       //     this.clientes = response.content as Cliente[]
       //
       // })
      ).subscribe(response => {
         this.clientes = response.content as Cliente[]
         this.paginator = response;
     }); // SIN EL subscribe EL OBSERVABLE NUNCA SE VA A EJECUTAR
   });
   // y no se va a mostrar la lista de clientes




    // Se recorre el listado de clientes preguntando si el id del cliente suscrito es igual al id del cliente de la lista
    this.modalService.notificarUpload.subscribe( cliente => {
      this.clientes = this.clientes.map(clienteOriginal => {
        if(cliente.id == clienteOriginal.id){
          clienteOriginal.foto = cliente.foto;
        }
        return clienteOriginal;
      })
    })
  }


  delete(cliente: Cliente): void{
    const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-outline-danger mr-2',
    cancelButton: 'btn btn-secondary'
  },
  buttonsStyling: false
})

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`,
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
      //reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.clienteService.delete(cliente.id).subscribe(
          response => {

            this.clientes = this.clientes.filter(cli => cli !== cliente)
            // this.clienteService.getClientes(0).subscribe(response => {
            //   this.clientes = response.content as Cliente[];
            //   this.paginator = response;
            // });

            const Toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true,
              onOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
              }
            })

            Toast.fire({
              icon: 'success',
              title: `Cliente ${cliente.nombre} ${cliente.apellido} eliminado.`
            })
          }
        )
     }
    })
  }

  abrirModal(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

}
