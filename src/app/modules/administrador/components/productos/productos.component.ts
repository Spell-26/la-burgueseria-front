import {Component, OnInit} from '@angular/core';
import {Producto, ProductoResponse} from "../../interfaces/producto";
import {ProductosService} from "../../services/productos.service";
import Swal from "sweetalert2";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ProductosComponent  implements OnInit{
  //  VARIABLES
  public productos : Producto[] = [];
  // CONSTRUCTOR E INICIALIZADORES
  constructor(private productosService : ProductosService, private sanitizer : DomSanitizer) {
  }
  ngOnInit(): void {
    this.productosService.refreshNeeded
      .subscribe(
        () =>{
          this.getAllProductos();
        }
      );
    this.getAllProductos();

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
    Swal.fire({
      title: 'Agregar Producto',
      html:
        '<input id="nombre" class="swal2-input" placeholder="Nombre">' +
        '<input id="precio" class="swal2-input" placeholder="Precio" type="number">' +
        '<input type="file" id="imagen" class="swal2-file" accept="image/*">' +

        '<textarea id="descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const precio: number = +(document.getElementById('precio') as HTMLInputElement).value;
        const imagen: File | undefined = (document.getElementById('imagen') as HTMLInputElement).files?.[0];
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;

        if(!nombre || !precio){
          Swal.showValidationMessage('Por favor, completa todos los campos');
        }else{
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

          this.crearProducto(productoSave).subscribe(
            (respuesta) =>{
              Swal.fire('Éxito', 'Insumo agregado correctamente', 'success');
            },
            (error) =>{
              Swal.fire('Error', 'Hubo un problema al agregar el insumo', 'error');
            }
          )
        }
      },
    });
  }


  //****************************
  //*******PETICIONES HTTP*******
  //****************************
  public getAllProductos(){
    this.productosService.getProductos()
      .subscribe(
        producto => {
          this.productos = producto.object;
          console.log(this.productos);

          this.productos.forEach(
            (item) =>{
              if(item.imagen){
                item.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + item.imagen);
              }
            }
          )
          console.log(this.productos);
        }
      );
  }
  private crearProducto(producto : Producto){
    const formData : FormData = new FormData();

    formData.append('nombre', producto.nombre);
    formData.append('precio' , producto.precio.toString());
    formData.append('imagen', producto.imagen);
    formData.append('desc', producto.descripcion);

    return this.productosService.crearProducto(formData);
  }
  public deleteProducto(id:number):void{
    this.productosService.deleteProducto(id)
      .subscribe();
  }

}
