import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {Cuenta} from "../interfaces/cuenta";

@Injectable({
  providedIn: 'root'
})
export class CuentasService {

  private _refreshNeeded = new Subject<void>();

  private apiUrl = 'http://localhost:8080/api/v1/cuenta';
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
