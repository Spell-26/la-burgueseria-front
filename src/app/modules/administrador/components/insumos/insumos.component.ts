import {Component, OnInit} from '@angular/core';
import {InsumosService} from "../../services/insumos.service";
import {insumoResponse} from "../../interfaces";
import {Observable} from "rxjs";


@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class InsumosComponent implements OnInit{
  public insumos?: insumoResponse;
  public nombreBusqueda : string = "";
  public isNombreBusqueda : boolean = false;
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


  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  public deleteInsumo( id : number ):void{
    this.insumosService.deleteInsumo(id)
      .subscribe();
  }

  private getAllInsumos(){
    this.insumosService.getInsumos()
      .subscribe( insumo => {
        this.insumos = insumo;
      });
  }
  public buscarInsumos(){
    if(this.nombreBusqueda.length == 0){
      this.setIsNombreBusqueda(false);
      this.getAllInsumos();
    }else{
      this.insumosService.buscarPorNombre(this.nombreBusqueda)
        .subscribe(insumo =>{
          this.insumos = insumo;
        });
      this.setIsNombreBusqueda(true);
    }

  }



}
