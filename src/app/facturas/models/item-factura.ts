import { Producto } from './producto';

export class ItemFactura {
  producto:Producto;
  cantidad:number = 1;
  importe: number;

// Ya esta calculado en el back pero tambien se puede usar desde aca
  public calcularImporte():number {
    return this.cantidad*this.producto.precio;
  }
}
