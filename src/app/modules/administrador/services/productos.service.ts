
import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Producto, ProductoResponse} from "../interfaces/producto";

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  //observabla (ayuda a saber cuando refrescar el componente)
  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  //url de la api
  private apiUrl = 'http://localhost:8080/api/v1/producto';
  constructor( private http : HttpClient) { }

  gerProductos(): Observable<ProductoResponse>{
    return this.http.get<ProductoResponse>(`${this.apiUrl}s`);
  }
  //crear producto
  crearProducto(producto: FormData):Observable<any>{
    return this.http.post(this.apiUrl, producto)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      )
  }
}
