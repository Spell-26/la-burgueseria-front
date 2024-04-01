
import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
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
  crearProducto(producto: Producto, img: any): Observable<any> {
    const params = new HttpParams()
      .set('nombre', producto.nombre)
      .set('precio', producto.precio.toString())
      .set('descripcion', producto.descripcion)
      .set('categoria', producto.categoriaProducto?.id.toString())
      .set('isPublicado', producto.isPublicado.toString())


    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream' // Establece el tipo de contenido como binario
    });

    let imagenBlob : Blob | null = null;

    if(img != null){
      imagenBlob = this.convertirImagenABlob(img);
    }

    // Enviar la solicitud POST con el formulario de datos
    return this.http.post(this.apiUrl,imagenBlob, { params, headers })
      .pipe(
        tap(() => {
          this._refreshNeeded.next();
        })
      );
  }


  convertirImagenABlob(imagen: File): Blob {
    return new Blob([imagen], { type: imagen.type });
  }
  //actualizar producto
  actualizarProducto(producto: Producto, img : any): Observable<any>{

    const params = new HttpParams()
      .set('id', producto.id)
      .set('nombre', producto.nombre)
      .set('precio', producto.precio.toString())
      .set('descripcion', producto.descripcion)
      .set('categoria', producto.categoriaProducto?.id.toString())
      .set('isPublicado', producto.isPublicado.toString())

    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream' // Establece el tipo de contenido como binario
    });

    const imagenBlob = this.convertirImagenABlob(img);

    return this.http.put(this.apiUrl, imagenBlob, {params, headers})
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  //PUBLICAR O QUITAR DE PUBLICACIÓN UN PRODUCTO
  publicarProducto(producto : Producto) : Observable<any>{
    const url = `${this.apiUrl}/${producto.id}`;
    return this.http.patch(url, producto)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );;
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
