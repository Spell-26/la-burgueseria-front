
import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Producto, ProductoResponse} from "../interfaces/producto";
import {EnvService} from "../utils/sharedMethods/env/env.service";

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
  private apiUrl = `${this.env.getUrl()}/producto`;
  constructor( private http : HttpClient, private env : EnvService) { }

  getProductos(): Observable<ProductoResponse>{
    return this.http.get<ProductoResponse>(`${this.apiUrl}s`);
  }
  //paginacion productos
  getProductosPageable(numeroPagina : number, tamanoPagina : number, order : string, asc : boolean) : Observable<any>{
    let params : HttpParams = new HttpParams()
      .set('page', numeroPagina.toString())
      .set('size', tamanoPagina.toString())
      .set('order', order)
      .set('asc', asc);

    return this.http.get<any>(`${this.apiUrl}s-page`, {params});
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
  //actualizar producto
  actualizarProducto(producto: Producto): Observable<any>{

    const formData : FormData = new FormData();

    formData.append('id', producto.id.toString())
    formData.append('nombre', producto.nombre);
    formData.append('precio' , producto.precio.toString());
    formData.append('imagen', producto.imagen);
    formData.append('desc', producto.descripcion);
    formData.append('categoria', producto.categoriaProducto?.id.toString());


    return this.http.put(`${this.apiUrl}/${producto.id}`, formData)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  //BUSCAR PRODCUTO POR NOMBRE
  buscarPorNombre(nombre : string) : Observable<ProductoResponse>{
    const url = `${this.apiUrl}/buscar/${nombre}`;
    return this.http.get<ProductoResponse>(url);
  }
  //  ELIMINAR PRODUCTO
  deleteProducto(id :number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(
          () =>{
            this._refreshNeeded.next();
          }
        )
      )
  }
}
