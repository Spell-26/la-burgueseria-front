import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoriaProducto, CategoriaProductoResponse} from "../interfaces/categoriaProducto";

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  private apiUrl = 'http://localhost:8080/api/v1/categoria-producto';
  constructor(private http : HttpClient) { }

  //eliminar categoria
  getCategoriasProductos():Observable<CategoriaProductoResponse>{
    return this.http.get<CategoriaProductoResponse>('http://localhost:8080/api/v1/categorias-productos');
  }
  //crear categoria
  crearCategoria(categoriaProducto : CategoriaProducto) : Observable<any>{
    return this.http.post(this.apiUrl, categoriaProducto)
      .pipe(
        tap(
          () =>{
            this._refreshNeeded.next()
          }
        )
      )
  }
  //eliminar categoría
  deleteCategoria(id : number) : Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
}
