import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Empleado, EmpleadoResponse} from "../interfaces/empleado";
import {EnvService} from "../utils/sharedMethods/env/env.service";

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  public _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor( private http : HttpClient, private env : EnvService) { }

  private apiUrl =  `${this.env.getUrl()}/empleado`;

  getEmpleados() : Observable<EmpleadoResponse>{
    return this.http.get<EmpleadoResponse>(`${this.apiUrl}s`)
  }
  getEmpleadosPageable(numeroPagina : number, tamanoPagina : number, order: string, asc : boolean) : Observable<any>{
    let params = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get<any>(`${this.apiUrl}s-page`, {params});
  }

  deleteEmpleado(id : number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(
          () =>{
            this._refreshNeeded.next()
          }
        )
      )
  }

  //crear empleado
  crearEmpleado(empleado : Empleado) : Observable<any>{
    return this.http.post(this.apiUrl, empleado)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  //actualizar empleado
  actualizarEmpleado(empleado : Empleado) : Observable<any>{
    const id : number = empleado.id;

    return this.http.put(`${this.apiUrl}/${id}`, empleado)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }

  //buscar empleado por nombre
  buscarPorNombre(nombre : string) : Observable<EmpleadoResponse>{
    return this.http.get<EmpleadoResponse>(`${this.apiUrl}/nombre/${nombre}`);
  }
}
