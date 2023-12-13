import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Ingreso} from "../interfaces/ingreso";

@Injectable({
  providedIn: 'root'
})
export class IngresoService {

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient) { }

  private apiUrl = 'http://localhost:8080/api/v1/ingreso';

  //CREAR INGRESO
  crearIngreso(ingreso : Ingreso) : Observable<any>{
    return this.http.post(this.apiUrl, ingreso)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }

  //OBTENER TODOS LOS INGRESOS PAGINADOS
  getIngresosPageable(numeroPagina: number, tamanoPagina: number, order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get(`${this.apiUrl}s-page`, {params});
  }
}
