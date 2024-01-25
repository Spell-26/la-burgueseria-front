import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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

  private apiUrl = 'http://localhost:8090/api/v1/ingreso';

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

  //OBTENER PAGINACION FILTRADA POR FECHAS
  getIngresoPagableByFecha(fechaInicio : string, fechaFin : string | null, numeroPagina: number, tamanoPagina: number, order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    let headers: HttpHeaders = new HttpHeaders()
      .set('fechaInicio', new Date(fechaInicio).toISOString());

    if (fechaFin != null) {
      headers = headers.set('fechaFin', new Date(fechaFin).toISOString());
    }

    return this.http.get(`${this.apiUrl}/fecha-page`, {headers, params})
  }
}
