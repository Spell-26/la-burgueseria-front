import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {Cuenta} from "../interfaces/cuenta";

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  private _refreshNeeded = new Subject<void>();

  private apiUrl = 'http://localhost:8090/api/v1/cuenta';
  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient) { }


  //CREAR CUENTA
  crearCuenta(cuenta : Cuenta) : Observable<any>{
      return this.http.post(this.apiUrl, cuenta)
        .pipe(
          tap(
            () => {
              this._refreshNeeded.next();
            }
          )
        );
  }

  //OBTENER CUENTAS POR FECHA
  cuentasByFecha(fechaInicio: string, fechaFin: string | null): Observable<any> {

    let headers: HttpHeaders = new HttpHeaders()
      .set('fechaInicio', new Date(fechaInicio).toISOString());

    if (fechaFin != null) {
      headers = headers.set('fechaFin', new Date(fechaFin).toISOString());
    }

    return this.http.get<any>(`${this.apiUrl}/fechas`, { headers });
  }
  //PAGINACION CUENTAS
  getCuentasPageable(numeroPagina: number, tamanoPagina: number, order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get<any>(`${this.apiUrl}s-page`, {params})
  }

  //ACTUALIZAR CUENTA
  actualizarCuenta(cuenta : Cuenta) : Observable<any>{
    const id : number = cuenta.id;
    return this.http.put(`${this.apiUrl}/${id}`, cuenta)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
}
