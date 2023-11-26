import {Component, OnInit} from '@angular/core';
import {Producto, ProductoResponse} from "../../interfaces/producto";
import {ProductosService} from "../../services/productos.service";
import Swal from "sweetalert2";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoriaProducto} from "../../interfaces/categoriaProducto";
import {CategoriaProductoService} from "../../services/categoria-producto.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Validators} from "@angular/forms";
import {ModalInsumosComponent} from "../../utils/modal-insumos/modal-insumos.component";
import {ModalLateralComponent} from "../../utils/modal-lateral/modal-lateral.component";
import {InsumosService} from "../../services/insumos.service";
import {insumo} from "../../interfaces";
import {ModalEditarProductoComponent} from "../../utils/modal-editar-producto/modal-editar-producto.component";

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ProductosComponent  implements OnInit {
  //  VARIABLES
  public categoriasProductos: CategoriaProducto[] = [];
  public productos: Array<any> = [];
  public insumos: insumo[] = [];
  public nombreBusqueda: string = "";
  public isNombreBusqueda : boolean = false;

  //parametros paginacion
  pagina = 0;
  tamano = 6;
  order = 'id';
  asc = true;
  isFirst = false;
  isLast = false;

  // CONSTRUCTOR E INICIALIZADORES
  constructor(private productosService : ProductosService,
              private sanitizer : DomSanitizer,
              private categoriaProductoService : CategoriaProductoService,
              private insumoService : InsumosService,
              private router : Router,
              public dialog : MatDialog) {
  }
  ngOnInit(): void {
    this.productosService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllProductos();
          this.getAllCategoriasProductos();
          this.getAllInsumos();
        }
      );
    this.getAllProductos();
    this.getAllCategoriasProductos();
    this.getAllInsumos();
  }
  //****************************
  //*******MÉTODOS*******
  //****************************


  /*  METODOS MODAL*/

   public openModal() : void{
     const camposProductos = [
       {nombre: 'nombre', label: 'Nombre', tipo: 'text', validadores: [Validators.required]},
       { nombre: 'precio', label: 'Precio', tipo: 'number', validadores: [Validators.required, Validators.pattern(/^[0-9]+$/)] },
       {nombre: 'imagen', labeñ: 'Imagen del producto', tipo: 'file'},
       { nombre: 'selector', label: 'Categoría', tipo: 'selector', opciones: this.categoriasProductos },
       { nombre: 'descripcion', label: 'Descripción', tipo: 'textarea', validadores: [Validators.required] },
     ];

     const dialogRef = this.dialog.open(ModalLateralComponent, {
       width: '400px', // Ajusta el ancho según tus necesidades
       position: { right: '0' }, // Posiciona el modal a la derecha
       height: '600px',
       data: {campos: camposProductos, titulo: 'Nuevo Producto'}
     });

     dialogRef.afterClosed().subscribe(result => {

       //crear instancias de los objetos a guardar en la db
       const categoriaProducto : CategoriaProducto = {
         id: result.selector,
         nombre: ""
       };

       //peticion para guardar
       const productoSave : Producto = {
         imagenUrl: null,
         id: 0,
         nombre : result.nombre,
         precio : result.precio,
         descripcion: result.descripcion,
         imagen : result.imagen,
         categoriaProducto : categoriaProducto,
       };

       console.log('Valores del formulario:', result);
       this.crearProducto(productoSave, categoriaProducto.id)
         .subscribe(
           respuesta =>{
             console.log(respuesta)
           },
           error => {
             console.log(error)
           }
         );
     });
   }

   //MODAL EDITAR PRODUCTO
  modalEditarProducto(producto : Producto) : void{
     const dialogRef = this.dialog.open(ModalEditarProductoComponent, {
       width: '400px', // Ajusta el ancho según tus necesidades
       position: { right: '0' }, // Posiciona el modal a la derecha
       height: '600px',
       data: {producto : producto},
     });

     dialogRef.afterClosed().subscribe(
       (result) => {
         if(result) {
            this.productosService.actualizarProducto(result)
              .subscribe(
                result =>{
                  console.log(result)
                },
                error => {
                  console.log(error)
                }
              );
         }
       }
     )
  }
  /*  FIN METODOS MODAL */
  onImageError(producto: any) {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    producto.imagenUrl = 'assets/img/placeholder-hamburguesa.png';
  }

  //cambio de estado para la variable nombre de busqueda
  public setIsNombreBusqueda(valor : boolean) :void{
    this.isNombreBusqueda = valor;
  }
  //avanzar y retroceder en la paginacion
  public  nextPage(){
    this.pagina+=1;
    this.getAllProductos()
  }
  public  previousPage(){
    this.pagina-=1;
    this.getAllProductos()
  }

  //FORNMNATEAR BYTES DE LAS IMAGENES
  private formatearImagen(productos : any){
    this.productos.forEach(
      (item) =>{
        if(item.imagen){
          item.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + item.imagen);
        }
      }
    );
  }
  //****************************
  //*******PETICIONES HTTP*******
  //****************************


  //consultar todos los productos
  public getAllProductos(){
    this.productosService.getProductosPageable(this.pagina, this.tamano, this.order, this.asc)
      .subscribe(
        data =>{
          this.productos = data.content;
          this.isFirst = data.first;
          this.isLast = data.last;
          //formatear la el byte que contiene la imagen
          this.formatearImagen(this.productos);
        },
        error => {
          console.log(error.error());
        }
      );
  }
  //obtener todos los insumos para
  //posteriormente enviarlos al modal de editar producto
  private getAllInsumos(){
    this.insumoService.getInsumos()
      .subscribe(
        data => {
          this.insumos = data.object;
        },
        error =>{
          console.log(error)
        }
      )
  }
  //BUSCAR POR NOMBRE
  public buscarProductos(){
    if(this.nombreBusqueda.length == 0){
      this.setIsNombreBusqueda(false);
      this.getAllProductos();
    }else{
      this.productosService.buscarPorNombre(this.nombreBusqueda)
        .subscribe(producto =>{
          this.productos = producto.object;
          this.formatearImagen(this.productos);
        });
      this.setIsNombreBusqueda(true);
    }
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

  //GUARDAR PRODUCTO
  private crearProducto(producto : Producto, categoriaid: number){
    const formData : FormData = new FormData();

    formData.append('nombre', producto.nombre);
    formData.append('precio' , producto.precio.toString());
    formData.append('imagen', producto.imagen);
    formData.append('desc', producto.descripcion);
    formData.append('categoria', categoriaid.toString());

    return this.productosService.crearProducto(formData);
  }

  //ELIMINAR PRODUCTO
  public deleteProducto(id:number):void{
    this.productosService.deleteProducto(id)
      .subscribe();
  }

}
