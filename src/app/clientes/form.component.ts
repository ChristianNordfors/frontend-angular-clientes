import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';

import Swal from 'sweetalert2';
import { Region } from './region';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  public cliente: Cliente = new Cliente();
  regiones: Region[];
  public titulo: string = "Crear cliente";
  public errores: string[];

  constructor(private clienteService: ClienteService,
              private router: Router,
              private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.cargarCliente();
  }

  cargarCliente(): void{
    // Suscribe al cliente
    this.activatedRoute.params.subscribe(params => {
      let id = params['id'];
      if(id){
        this.clienteService.getCliente(id).subscribe( (cliente) => this.cliente = cliente)
      }
    });
    // Suscribe al listado de regiones para crear, editar  para poblar lar lista desplegable select
    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones);
  }

  // MAnejado con el map asi que no se usa json.cliente.nombre etc etc
  public create(): void{
    this.clienteService.create(this.cliente)
    .subscribe( cliente => {
      this.router.navigate(['/clientes'])
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
          title: `Cliente ${cliente.nombre} ${cliente.apellido} añadido`
          })
    },
    err => {
      this.errores =  err.error.errors as string[];
      console.error(err.error.errors);
      if(err.status==500) {
        Swal.fire('Error al crear cliente', 'El email ya se encuentra registrado en la base de datos.', 'warning');
        // Swal.fire('Error al actualizar', err.error.error, 'warning');
    }
  }  );
  }

  update():void{
    // Se asignan las facturas del cliente a null porque aca unicamente se quiere actualizar los datos del cliente
    //NOTA: Sin esto funciona igual ya que esta solucionado en el backend(clases entity) con allowSetters: true
    this.cliente.facturas = null;
    console.log(this.cliente);


    this.clienteService.update(this.cliente)
    .subscribe( json => {
      this.router.navigate(['/clientes'])

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
          title: `Cliente ${json.cliente.nombre} ${json.cliente.apellido} actualizado`
          })
      },
      err => {
        this.errores =  err.error.errors as string[];
        console.error(err.error.errors);
        if(err.status==500) {
          Swal.fire('Error al actualizar', 'El email ya se encuentra registrado en la base de datos.', 'warning');
          // Swal.fire('Error al actualizar', err.error.error, 'warning');
        }
      }
    );
  }

// El primer objeto corresponde a cada una de las regiones de la iteracion del ngFor,
// el objeto 2 es el asignado al cliente. Y estas se van a comprar para mostrarse despues con [compareWith]
  compararRegion(ob1:Region,ob2:Region): boolean{
    if(ob1 === undefined && ob2 === undefined){
      return true;
    }
    // Solamente para editar porque el ob2 en un cliente nuevo va a estar vacio
    // Itera hasta en contrar la igualdad si ambos son distintos a null
      return ob1 == null || ob2 == null? false: ob1.id===ob2.id;
      //return ob1 === null || ob2 === null || ob1 === undefined || ob2 === undefined ? false: ob1.id===ob2.id;
      //return ob1 && ob2 ? ob1.id === ob2.id:ob1 === ob2;
  }

}
