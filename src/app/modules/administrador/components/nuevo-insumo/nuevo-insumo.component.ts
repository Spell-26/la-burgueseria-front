import {Component, OnInit} from '@angular/core';
import {Insumo} from "../../interfaces";
import {InsumosService} from "../../services/insumos.service";

@Component({
  selector: 'app-nuevo-insumo',
  templateUrl: './nuevo-insumo.component.html',
  styleUrls: ['./nuevo-insumo.component.css']
})
export class NuevoInsumoComponent implements OnInit{
  public insumos : any[] = [];
  seleccionados : boolean[] = [];

  constructor(private insumosService : InsumosService) {
    this.insumosService.getInsumos()
      .subscribe( insumo => {
        this.insumos = insumo.object;
        console.log(insumo);

        this.seleccionados  = new Array(this.insumos.length).fill(false);
      });
  }

  ngOnInit(): void {
  }

  //selector insumos


  seleccionar(index : number){
    this.seleccionados[index] = !this.seleccionados[index]
  }

}
