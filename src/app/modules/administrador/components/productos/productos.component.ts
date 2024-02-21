import {Component, OnInit} from '@angular/core';
import {Producto, ProductoResponse} from "../../interfaces/producto";
import {ProductosService} from "../../services/productos.service";
import Swal from "sweetalert2";
import {DomSanitizer} from "@angular/platform-browser";
import {CategoriaProducto} from "../../interfaces/categoriaProducto";
import {CategoriaProductoService} from "../../services/categoria-producto.service";

import {MatDialog} from "@angular/material/dialog";
import {InsumosService} from "../../services/insumos.service";
import {insumo, InsumoProducto} from "../../interfaces";
import {ModalEditarProductoComponent} from "../../utils/modal-editar-producto/modal-editar-producto.component";
import {ModalNuevoProductoComponent} from "../../utils/modal-nuevo-producto/modal-nuevo-producto.component";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {AlertasService} from "../../utils/sharedMethods/alertas/alertas.service";
import {LoginService} from "../../../home/services/auth/login.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ProductosComponent  implements OnInit {
  //  VARIABLES
  public categoriasProductos: CategoriaProducto[] = [];
  public productos: Array<any> = [];
  public productosAgrupados: { [p: string]: Producto[] } = {}
  public insumos: insumo[] = [];
  public nombreBusqueda: string = "";
  public isNombreBusqueda : boolean = false;
  public mostrarBotones : boolean = false;
  //flag para el popo over de la descripcion
  mostrarTextoCompleto: boolean = false;
  //verificacion de sesion
  userLoginOn : boolean = false;
  //verificar carga de datos
  isLoading = true;
  isLoadingPartial = false;


  // CONSTRUCTOR E INICIALIZADORES
  constructor(private productosService : ProductosService,
              private sanitizer : DomSanitizer,
              private categoriaProductoService : CategoriaProductoService,
              private insumoService : InsumosService,
             private ippService : InsumosPorProductoService,
              public dialog : MatDialog,
              private alertaService : AlertasService,
              private loginService : LoginService,
              private router : Router) {
  }
  ngOnInit(): void {

    this.loginService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });
    if(!this.userLoginOn){
      this.router.navigateByUrl('home/login')
    }else{
      this.productosService.refreshNeeded
        .subscribe(
          () =>{
            this.getProductos()
            this.getAllCategoriasProductos();
            this.getAllInsumos();
          }
        );
      this.getProductos()
      this.getAllCategoriasProductos();
      this.getAllInsumos();
    }


  }
  //****************************
  //*******MÉTODOS*******
  //****************************

  //Funcion para agrupar los productos por categoria
  private agruparProductosPorCategoria(productos: Producto[]): { [key: string]: Producto[] } {
    return productos.reduce((agrupados : any, producto) => {
      const categoriaNombre = producto.categoriaProducto?.nombre || 'Sin Categoría';

      if (!agrupados[categoriaNombre]) {
        agrupados[categoriaNombre] = [];
      }

      agrupados[categoriaNombre].push(producto);

      return agrupados;
    }, {});
  }
  // Método para obtener las claves de un objeto
  keys(obj: any): string[] {
    return Object.keys(obj);
  }

  /*  METODOS MODAL*/

   //MODAL NUEVO PRODUCTO V2
  public modalNuevoProducto(){
    const dialogRef = this.dialog.open(ModalNuevoProductoComponent, {
      width: '400px',
      position: {right: '0'},
      height: '600px',
    });

    dialogRef.afterClosed().subscribe(
      //acciones y peticiones http luego de confirmar el submit del modal
      result => {
        if(result){
          const categoriaId = result.producto.categoriaProducto.id;
          const producto : Producto = result.producto;
          let insumosProducto :InsumoProducto[]  = result.ingredientes;

          this.crearProducto(producto, categoriaId)
            .subscribe(
              result => {
                //id del producto para asignarlo dentro de cada ipp
                const idProducto = result.object.id;
                if(insumosProducto.length > 0){
                  for(let i = 0; i < insumosProducto.length; i++){
                    //asignar el id del producto a todos los ipp
                    insumosProducto[i].producto.id = idProducto;
                    //crear el ipp de la iteración actual
                    this.ippService.createIpp(insumosProducto[i])
                      .subscribe(
                        result => {

                        },
                        error => {
                        }
                      );
                  }
                }

                //alerta de confirmacion al crear
                this.alertaService.alertaConfirmarCreacion();
              },
              error => {
                if(error.status === 409){
                  const mensaje : string = "¡Parece que ya existe un producto con el mismo nombre!";
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }
              }
            )
        }

      }
    )
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
         if (result) {

           // Verificar si la imagen cumple con la característica de base64
           if (typeof result.imagen === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(result.imagen)) {
             // Devolver la imagen que está en formato BloB (Binary Large Object) a un archivo
             // Crear un Blob desde la cadena base64
             const byteCharacters = atob(result.imagen);
             const byteNumbers = new Array(byteCharacters.length);

             for (let i = 0; i < byteCharacters.length; i++) {
               byteNumbers[i] = byteCharacters.charCodeAt(i);
             }

             const byteArray = new Uint8Array(byteNumbers);
             const blob = new Blob([byteArray], { type: "image/png" });

             // Crear un archivo desde el BloB
             const file = new File([blob], "imagen.png", { type: "image/png" });

             result.imagen = file;
           }

           this.productosService.actualizarProducto(result)
             .subscribe(
               updatedResult => {
                 // Lógica después de actualizar el producto
                 this.alertaService.alertaConfirmarCreacion();
               },
               error => {
                 console.log(error);
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


  //obtener todos los productos
  public getProductos(){
    this.isLoading = true
    this.productosService.getProductos()
      .subscribe(
        data => {
          if(data){
            this.productos = data.object;
            //formatear la el byte que contiene la imagen
            this.formatearImagen(this.productos);
            //agrupar los productos por categoria
            this.productosAgrupados = this.agruparProductosPorCategoria(this.productos);
          }

        }, error => {
          if(error.error.trace.startsWith("io.jsonwebtoken.ExpiredJwtException")){
            this.loginService.logout(); //quitar todas las credenciales de sesion
            this.router.navigateByUrl("home/login");
            location.reload();
            const mensaje = "La sesión ha caducado."
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          }else{
            console.log(error)
          }
        },
        () => {
          this.isLoading = false;
        }
      )
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
    this.isLoadingPartial = true;
    if(this.nombreBusqueda.length == 0){
      this.setIsNombreBusqueda(false);
      this.getProductos()
      this.isLoadingPartial = false;
    }else{
      this.productosService.buscarPorNombre(this.nombreBusqueda)
        .subscribe(producto =>{
          this.productos = producto.object;
          this.formatearImagen(this.productos);
          this.productosAgrupados = this.agruparProductosPorCategoria(this.productos);
        },error => {
            console.log(error)
          },
          () => {
          this.isLoadingPartial = false;
          }
          );
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
    this.alertaService.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){

            this.productosService.deleteProducto(id)
              .subscribe();

            this.alertaService.alertaEliminadoCorrectamente();
          }else if( result.dismiss === Swal.DismissReason.cancel){
            this.alertaService.alertaSinModificaciones()
          }
        }
      )
  }

}
