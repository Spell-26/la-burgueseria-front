import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {CategoriaProducto, CategoriaProductoResponse} from "../interfaces/categoriaProducto";
import {EnvService} from "../utils/sharedMethods/env/env.service";

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  private apiUrl = `${this.env.getUrl()}/categoria-producto`;
  constructor(private http : HttpClient, private env : EnvService) { }

  //eliminar categoria
  getCategoriasProductos():Observable<CategoriaProductoResponse>{
    return this.http.get<CategoriaProductoResponse>(`${this.env.getUrl()}/categorias-productos`);
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
