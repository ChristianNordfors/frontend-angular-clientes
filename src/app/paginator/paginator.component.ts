import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'paginator-nav',
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent implements OnInit, OnChanges {

  @Input() paginador: any;

  paginas: number[];

  desde: number;

  hasta: number;

  constructor() { }

  ngOnInit(): void {
    this.initPaginator();

    // Se conviernte el paginador en un arreglo ya que viene con datos json y no es un iterable
    // Se llena el arreglo con algun valor, por ejemplo 0 con fill, para despues modficarlos con map
    // +1 para que empiece en 1 porque desde el back empieza en 0. El valor no se usa asi que con _ no da warning
  }

  ngOnChanges(changes: SimpleChanges){
    // Está al tanto de los cambios en el paginador inyectado por el @Input desde el componente padre
    let paginadorActualizado = changes['paginador'];
    // Si tiene un estado anterior que haya cambiado invocamos el initPaginator()
    if(paginadorActualizado.previousValue){
      this.initPaginator();
    }

  }

  private initPaginator():void {
    this.desde = Math.min(Math.max(1, this.paginador.number-4), this.paginador.totalPages-5);
    this.hasta = Math.max(Math.min(this.paginador.totalPages, this.paginador.number + 1), 6 );

    if(this.paginador.totalPages>5){
      this.paginas = new Array(this.hasta - this.desde + 1).fill(0).map((_valor,indice) => indice + this.desde );
    } else {
      this.paginas = new Array(this.paginador.totalPages).fill(0).map((_valor,indice) => indice + 1 );
    }
  }


}
