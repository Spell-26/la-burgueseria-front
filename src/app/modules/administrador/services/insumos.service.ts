import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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
  getInsumosPageable(numeroPagina : number, tamanoPagina : number, order: string, asc : boolean) : Observable<any>{
    let params = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get<any>('http://localhost:8080/api/v1/insumos2', {params})
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
  actualizarInsumos(datos: insumo) : Observable<any> {



      const id = datos.id;
      const url = `${this.apiUrl}/${id}`;

      // Configura un encabezado personalizado con el ID
      const headers = new HttpHeaders().set('Id', id.toString());

      // Realiza la solicitud PUT y agrega la respuesta al array de respuestas


     return this.http.put(url, datos, { headers });

  }

  //busrca insumo por nombre
  buscarPorNombre(nombre : string) : Observable<insumoResponse>{
    const url = `${this.apiUrl}/buscar/${nombre}`;
    return this.http.get<insumoResponse>(url);
  }


}
