import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {Mesa, MesaResponse} from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class MesasService {

  //observabla (ayuda a saber cuando refrescar el componente)
  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor( private http : HttpClient) { }

  private apiUrl = 'http://localhost:8080/api/v1/mesa';

  //obtener todas las mesas sin paginación
  public getMesas() : Observable<MesaResponse>{
    return this.http.get<MesaResponse>(`${this.apiUrl}s`);
  }
  //obtner todas las mesas con paginacion
  getMesasPageable(numeroPagina: number, tamanoPagina: number, order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get<any>(`${this.apiUrl}s-page`, {params})
  }

  //ELIMINAR MESA
  deleteMesa(id : number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(
          () =>{
            this._refreshNeeded.next();
          }
        )
      );
  }
  //NUEVA MESA
  createMesa(mesa : Mesa): Observable<any>{
    return this.http.post(`${this.apiUrl}`, mesa)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }

  //ACTUALIZAR MESA
  actualizarMesa(datos : Mesa) : Observable<any>{
    const id = datos.id;



    return this.http.put(`${this.apiUrl}/${id}`, datos)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }

  //BUSCAR MESA POR NUMERO
  buscarPorNumeroMesa(numero : number) : Observable <MesaResponse>{
    return this.http.get<MesaResponse>(`${this.apiUrl}/numero-mesa/${numero}`)
  }
}
