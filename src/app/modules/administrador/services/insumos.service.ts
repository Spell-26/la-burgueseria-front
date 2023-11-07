import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject} from "rxjs";
import {Insumo} from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class InsumosService {

  private _refreshNeeded = new Subject<void>()

  constructor( private http : HttpClient) { }

  getInsumos(): Observable<Insumo>{
    return this.http.get<Insumo>('http://localhost:8080/api/v1/insumos');
  }

  deleteInsumo(id : number):void{
    console.log(id)
    this.http.delete(`http://localhost:8080/api/v1/insumo/${id}`)
      .subscribe(
        () => {
          console.log("Registro eliminado exitosamente")
        },
        (error) => {
          console.error("Error al eliminar el registro", error)
        }
      )
  }
}
