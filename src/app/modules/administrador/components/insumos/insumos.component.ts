import {Component, OnInit} from '@angular/core';
import {InsumosService} from "../../services/insumos.service";
import {Insumo} from "../../interfaces";


@Component({
  selector: 'app-insumos',
  templateUrl: './insumos.component.html',
  styleUrls: ['./insumos.component.css']
})
export class InsumosComponent implements OnInit{
  public insumos?: Insumo;
  constructor(private insumosService : InsumosService) {
    this.insumosService.getInsumos()
      .subscribe( insumo => {
        this.insumos = insumo;
        console.log(insumo);
      });
  }

  public deleteInsumo( id : number ):void{
    this.insumosService.deleteInsumo(id);
  }

  ngOnInit(): void{}
}
