import {Component, OnInit, ViewChild} from '@angular/core';
import {InsumosService} from "../../services/insumos.service";
import {InsumoPaginacion, insumoResponse} from "../../interfaces";
import {Observable} from "rxjs";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";


@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class InsumosComponent implements OnInit{
  public insumos!: Array<any>;
  public nombreBusqueda : string = "";
  public isNombreBusqueda : boolean = false;
  //parametros paginacion
  pagina = 0;
  tamano = 10;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;
  constructor(private insumosService : InsumosService) {

  }
  ngOnInit(): void{

    this.insumosService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllInsumos();
        }
      );
    this.getAllInsumos();
  }

  //****************************
  //*******MÉTODOS*******
  //****************************
  public setIsNombreBusqueda(valor : boolean) :void{
    this.isNombreBusqueda = valor;
  }
  public limpiarBusqueda(){
    this.isNombreBusqueda = false;
    this.getAllInsumos();
    this.nombreBusqueda ="";
  }
  public  nextPage(){
    this.pagina+=1;
    this.getAllInsumos();
  }
  public  previousPage(){
    this.pagina-=1;
    this.getAllInsumos();
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  public deleteInsumo( id : number ):void{
    this.insumosService.deleteInsumo(id)
      .subscribe();
  }

  private getAllInsumos(){
    this.insumosService.getInsumosPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data => {
          this.insumos = data.content;
          this.isFirst = data.first;
          this.isLast = data.last;
          console.log(data)
        },
        error => {
          console.log(error.error())
        }
      );

  }
  public buscarInsumos(){
    if(this.nombreBusqueda.length == 0){
      this.setIsNombreBusqueda(false);
      this.getAllInsumos();
    }else{
      this.insumosService.buscarPorNombre(this.nombreBusqueda)
        .subscribe(insumo =>{
          this.insumos = insumo.object;
        });
      this.setIsNombreBusqueda(true);
    }

  }

}
