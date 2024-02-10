import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {EnvService} from "../utils/sharedMethods/env/env.service";
import {Observable, Subject, tap} from "rxjs";
import {GestionCaja} from "../interfaces/gestionCaja";

@Injectable({
  providedIn: 'root'
})
export class GestionCajaService {

  constructor(private http : HttpClient, private env : EnvService) { }

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }

  private apiUrl = `${this.env.getUrl()}/gestion-caja`;

  //Crear gestion caja
  crearGestionCaja(gestionCaja : GestionCaja): Observable<any>{
    return this.http.post(this.apiUrl, gestionCaja)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      )
  }

  //consultar caja por fecha
  getGestionCajaByFecha(fechaInicio : string, fechaFin : string | null) : Observable<any>{

    let headers : HttpHeaders = new HttpHeaders()
      .set('fechaInicio', new Date(fechaInicio).toISOString());

    if( fechaFin != null){
      headers = headers.set('fechaFin', new Date(fechaFin).toISOString());
    }

    return this.http.get(`${this.apiUrl}/fechas`, {headers});
  }

  //Actualizar gestion caja
  actualizarGestionCaja(gestionCaja : GestionCaja) : Observable<any>{
    const id : number = gestionCaja.id;

    return this.http.put(`${this.apiUrl}/${id}`, gestionCaja)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  //Obtener todos los gestion caja existentes
  listAll() : Observable<any>{
    return this.http.get(this.apiUrl);
  }
  //obtener el resumen
  getResumen() : Observable<any>{
    return this.http.get(`${this.apiUrl}/resumen`);
  }
}
