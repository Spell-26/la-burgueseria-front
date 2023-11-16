import {Component, OnInit} from '@angular/core';
import {Producto, ProductoResponse} from "../../interfaces/producto";
import {ProductosService} from "../../services/productos.service";
import Swal from "sweetalert2";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoriaProducto} from "../../interfaces/categoriaProducto";
import {CategoriaProductoService} from "../../services/categoria-producto.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ProductosComponent  implements OnInit{
  //  VARIABLES
  public categoriasProductos : CategoriaProducto[] = [];
  public productos : Producto[] = [];
  // CONSTRUCTOR E INICIALIZADORES
  constructor(private productosService : ProductosService,
              private sanitizer : DomSanitizer,
              private categoriaProductoService : CategoriaProductoService,
              private router : Router) {
  }
  ngOnInit(): void {
    this.productosService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllProductos();
          this.getAllCategoriasProductos();
        }
      );
    this.getAllProductos();
    this.getAllCategoriasProductos();

  }
  //****************************
  //*******MÉTODOS*******
  //****************************
  onImageError(producto: any) {
    console.error(`Error cargando la imagen para el producto: ${producto.nombre}`);
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    producto.imagenUrl = 'assets/img/placeholder-hamburguesa.png';
  }
  modalNuevoProducto() {

    const opcionesCategoria: string[] = [];
    this.categoriasProductos.forEach(categoria =>{
      opcionesCategoria.push(`<option value="${categoria.id}">${categoria.nombre}</option>`)
    })

    Swal.fire({
      title: 'Agregar Producto',
      html:
        '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
        '<input id="precio" class="swal2-input" placeholder="Precio" type="number">' +
        '<input type="file" id="imagen" class="swal2-file" accept="image/*">' +
        '<select id="categoria" class="swal2-select">' +
        '<option value="" disabled selected>Selecciona una categoria</option>'+
        opcionesCategoria.join('') +
        '</select>'+
        '<textarea id="descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const precio: number = +(document.getElementById('precio') as HTMLInputElement).value;
        const imagen: File | undefined = (document.getElementById('imagen') as HTMLInputElement).files?.[0];
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
        const categoriaId = (document.getElementById('categoria') as HTMLSelectElement).value;
        let id:number = parseInt(categoriaId, 10);
        if(!nombre || !precio){
          Swal.showValidationMessage('Por favor, completa todos los campos');
        }else{

          const categoriaProducto : CategoriaProducto = {
            id: categoriaId,
            nombre: ""
          };
          //peticion para guardar
          const productoSave : Producto = {
            imagenUrl: null,
            id: 0,
            nombre : nombre,
            precio : precio,
            descripcion: descripcion,
            imagen : imagen,
            categoriaProducto : null,
          };

          this.crearProducto(productoSave, id).subscribe(
            (respuesta) =>{
              Swal.fire('Éxito', 'Producto agregado correctamente', 'success');
            },
            (error) =>{
              Swal.fire('Error', 'Hubo un problema al agregar el producto', 'error');
            }
          )
        }
      },
    });
  }

  //****************************
  //*******PETICIONES HTTP*******
  //****************************


  //consultar todos los productos
  public getAllProductos(){
    this.productosService.getProductos()
      .subscribe(
        producto => {
          this.productos = producto.object;
          this.productos.forEach(
            (item) =>{
              if(item.imagen){
                item.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + item.imagen);
              }
            }
          )
        }
      );
  }
  //consultar todas las categorias de productos
  public getAllCategoriasProductos(){
    this.categoriaProductoService.getCategoriasProductos()
      .subscribe(
        categoriaProcuto =>{
          this.categoriasProductos = categoriaProcuto.object;
        }
      )
  }
  private crearProducto(producto : Producto, categoriaid: number){
    const formData : FormData = new FormData();

    formData.append('nombre', producto.nombre);
    formData.append('precio' , producto.precio.toString());
    formData.append('imagen', producto.imagen);
    formData.append('desc', producto.descripcion);
    formData.append('categoria', categoriaid.toString());



    return this.productosService.crearProducto(formData);
  }
  public deleteProducto(id:number):void{
    this.productosService.deleteProducto(id)
      .subscribe();
  }

}
