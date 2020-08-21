import { Component, OnInit, Input } from '@angular/core';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
import { ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { HttpEventType } from '@angular/common/http';
import { AuthService } from 'src/app/usuarios/auth.service';
import { FacturaService } from '../../facturas/services/factura.service';
import { Factura } from '../../facturas/models/factura';
import Swal from 'sweetalert2';

@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {

  @Input() cliente: Cliente;

  titulo: string = "Detalle del cliente";
  //cliente: Cliente;

  public fotoSeleccionada: File;
  progreso: number = 0;

  nombreCampoImagen: string = 'Seleccionar imagen';

  // ActivatedRoute como con el paginador se necesita cuando cambia el parametro del id
  constructor(private clienteService: ClienteService, private activatedRoute: ActivatedRoute,
              public modalService: ModalService,
              public authService: AuthService,
              private facturaService: FacturaService) { }

  ngOnInit(): void {
    // suscribe para obtener el detalle del cliente cuando cambia el parametro del id
// No es necesario porque la instancia está inyectada con @Input()
    // this.activatedRoute.paramMap.subscribe(params =>{
    //   let id:number = +params.get('id');
    //   if(id){
    //     this.clienteService.getCliente(id).subscribe(cliente =>{
    //       this.cliente = cliente;
    //     });
    //   }
    // });
  }

  seleccionarFoto(event) {
    // maneja un arreglo pero seleccionamos el unico que se esta subiendo
    this.fotoSeleccionada = event.target.files[0];

    console.log(this.fotoSeleccionada);

    // indexOf metodo del tipo String que buscar en la cadena si hay coicidencia con 'image' y regresa la primera posicion(ocurrencia)
    // que encuentra. Si no encuentra esa "palabra" regresa -1
    if(this.fotoSeleccionada.type.indexOf('image')<0){
      swal.fire('Error al seleccionar la imagen', 'El archivo debe ser una imagen', 'error');
      this.fotoSeleccionada = null;
    }
    if(this.fotoSeleccionada){
      this.progreso = 0;
      this.nombreCampoImagen = `Imagen lista para subir: ${this.fotoSeleccionada.name}`;
    }
  }

  subirFoto() {

    if(!this.fotoSeleccionada){
      swal.fire('Error', 'Debe seleccionar una foto', 'error');
    } else {
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id)
      .subscribe(event => {
        if(event.type === HttpEventType.UploadProgress){
          this.progreso = Math.round((event.loaded/event.total)*100);
        } else if(event.type === HttpEventType.Response){
          let response: any = event.body;
          // se recupera el tipo cliente despues del HttpEvent
          this.cliente = response.cliente as Cliente;

          // A traves del emit() se emite el cliente actualizado con la nueva foto
          this.modalService.notificarUpload.emit(this.cliente);
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
            title: `${response.mensaje}`
          })
        }

        //this.cliente = cliente;
        //swal.fire('Carga exitosa', `La foto se ha subido correctamente: ${this.cliente.foto}`, 'success');
      });
    }

  }

  cerrarModal() {
    this.fotoSeleccionada = null;
    this.progreso = 0;
    this.nombreCampoImagen = 'Seleccionar imagen';
  }

  delete(factura:Factura):void{
    const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-outline-danger mr-2',
    cancelButton: 'btn btn-outline-secondary'
  },
  buttonsStyling: false
})

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Eliminar factura ${factura.descripcion}?`,
      icon: 'warning',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
      //reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.facturaService.delete(factura.id).subscribe(
          response => {

            this.cliente.facturas = this.cliente.facturas.filter(f => f !== factura)
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
              title: `Factura ${factura.descripcion} eliminada.`
            })
          }
        )
     }
    })
  }


}
