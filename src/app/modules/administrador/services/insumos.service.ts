import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {insumoResponse, insumo} from "../interfaces";


@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  //observabla (ayuda a saber cuando refrescar el componente)
  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }

  private apiUrl = 'http://localhost:8080/api/v1/insumo';

  constructor( private http : HttpClient) { }

  getInsumos(): Observable<insumoResponse>{
    return this.http.get<insumoResponse>('http://localhost:8080/api/v1/insumos');
  }

  deleteInsumo(id : number):Observable<any>{
    return this.http.delete(`http://localhost:8080/api/v1/insumo/${id}`)
      .pipe(
        tap(
          () =>{
            this._refreshNeeded.next()
          }
        )
      )
  }

  //crear insumo
  crearInsumo(insumo: insumo): Observable<any>{
    return this.http.post(this.apiUrl,insumo)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  //actualizar insumo
  actualizarInsumos(datos: insumo[]) : Observable<any>[] {
    const responses: Observable<any>[] = [];

    for (const insumo of datos) {
      const id = insumo.id;
      const url = `${this.apiUrl}/${id}`;

      // Configura un encabezado personalizado con el ID
      const headers = new HttpHeaders().set('Id', id.toString());

      // Realiza la solicitud PUT y agrega la respuesta al array de respuestas
      responses.push(this.http.put(url, insumo, { headers }));
    }
    return responses;

  }

  //busrca insumo por nombre
  buscarPorNombre(nombre : string) : Observable<insumoResponse>{
    const url = `${this.apiUrl}/buscar/${nombre}`;
    return this.http.get<insumoResponse>(url);
  }


}
