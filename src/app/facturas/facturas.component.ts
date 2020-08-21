import { Component, OnInit } from '@angular/core';
import { Factura } from './models/factura';
import { ClienteService } from '../clientes/cliente.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FacturaService } from './services/factura.service';
import Swal from 'sweetalert2';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith, flatMap} from 'rxjs/operators';
import { Producto } from './models/producto';

import { ItemFactura } from './models/item-factura';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html'
})
export class FacturasComponent implements OnInit {

  titulo: string = 'Nueva factura';
  factura: Factura = new Factura();

  autoCompleteControl = new FormControl();
  // productos: string[] = ['Mesa', 'Tablet', 'Sony', 'Samsung', 'Tv', 'Bicicleta'];
  productosFiltrados: Observable<Producto[]>;

  constructor(private clienteService: ClienteService,
              private activatedRoute: ActivatedRoute,
              private facturaService: FacturaService,
              private router: Router) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params =>{
      // ('clienteId') mismo nombre que en el parametros de las rutas
      let clienteId = +params.get('clienteId');
      this.clienteService.getCliente(clienteId).subscribe(cliente => this.factura.cliente = cliente);
    });

    this.productosFiltrados = this.autoCompleteControl.valueChanges
      .pipe(
        startWith(),
        // El valor es el objeto producto que contiene el nombre(este sí es un string). Este map Convierte el objeto producto al nombre del producto en un valor string
        // Si value no es string se usa value.nombre
        map(value => typeof value == 'string' ? value : value.nombre ),
        // flatMap(en lugar de map) aplanar el observable que viene de _filter en el observable que se va a crear a partir del valueChanges
        flatMap(value => value ? this._filter(value) : [])
      );
  }


  private _filter(value: string): Observable<Producto[]> {
    const filterValue = value.toLowerCase();

    return this.facturaService.filtrarProductos(filterValue);
  }

  // trabaja con [displayWith]
  mostrarNombre(producto?: Producto): string | undefined {
    return producto? producto.nombre : undefined;
  }

  seleccionarProducto(event: MatAutocompleteSelectedEvent): void {
    // Se obtiene el producto seleccionado a traves del objeto event del (optionSelected)=
    let producto = event.option.value as Producto;
    console.log(producto);

    // Cuando se agrega un producto verifica qeu exista y suma o crea uno nuevo
    if(this.existeItem(producto.id)){
      this.incrementaCantidad(producto.id);
    } else {
    let nuevoItem = new ItemFactura();
    nuevoItem.producto = producto;
    this.factura.items.push(nuevoItem);
    }
    this.autoCompleteControl.setValue('');
    event.option.focus();
    event.option.deselect();
  }

  actualizarCantidad(id:number, event:any): void{
    let cantidad: number = event.target.value as number;

    if(cantidad == 0){
      return this.eliminarItemFactura(id);
    }

    this.factura.items = this.factura.items.map((item:ItemFactura) => {
      if(id === item.producto.id){
        item.cantidad = cantidad;
      }
      return item;
    });
  }

  existeItem(id:number):boolean {
    let existe = false;
    this.factura.items.forEach((item: ItemFactura) => {
      if(id === item.producto.id){
        existe = true
      }
    });
    return existe;

  }

  incrementaCantidad(id:number): void {
    this.factura.items = this.factura.items.map((item:ItemFactura) => {
      if(id === item.producto.id){
        ++item.cantidad;
        //item.cantidad = item.cantidad+1;
      }
      return item;
    });
  }

  eliminarItemFactura(id: number): void{
    this.factura.items = this.factura.items.filter((item: ItemFactura) => id != item.producto.id);
  }

  create():void{
    console.log(this.factura);

    // EL ERROR TAMBIEN SE PUEDE MANEJAR PROGRAMATICAMENTE SEC. 186

    this.facturaService.create(this.factura).subscribe(factura =>{
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
        title: `Factura ${factura.descripcion} creada con éxito.`
      })
      this.router.navigate(['/facturas', factura.id]);
      //this.router.navigate(['/cliente']);
    });
  }

}
