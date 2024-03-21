import {Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {ProductosService} from "../administrador/services/productos.service";

import {Producto} from "../administrador/interfaces";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
isLoading = false;
public productos : Producto[] = [];
  public productosAgrupados: { [p: string]: Producto[] } = {};
  currentCategoryIndex: number = 0;
  categories: string[] = [];

constructor(private elementRef: ElementRef,
            private productoService : ProductosService,
            private sanitizer : DomSanitizer,) {
}
  ngOnInit(): void {
  this.getProductos();
  }

  scrollToMenu(): void {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showScrollBox: boolean = false;

  @HostListener('scroll', ['$event'])
  onScroll(event : any) {
    const contentElement = this.elementRef.nativeElement.querySelector('.content');
    const contentScrollTop = contentElement.scrollTop;

    // Si el usuario ha llegado al principio o al final del scroll
    if (contentScrollTop === 0 || contentElement.scrollHeight - contentElement.clientHeight === contentScrollTop) {
      this.showScrollBox = true;
      setTimeout(() => {
        this.showScrollBox = false;
      }, 4000);
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

  // metodos para cambiar de pagina den el carusel
  prevCategory() {
    this.currentCategoryIndex = (this.currentCategoryIndex - 1 + this.categories.length) % this.categories.length;
  }

  nextCategory() {
    this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
  }

  onImageError(producto: any) {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    producto.imagenUrl = 'assets/img/placeholder-hamburguesa.png';
  }

  //FORNMNATEAR BYTES DE LAS IMAGENES
  private formatearImagen(){
    this.productos.forEach(
      (item) =>{
        if(item.imagen){
          item.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + item.imagen);
        }
      }
    );
  }



  //PETICIONES HTTP
  private getProductos(){
    this.isLoading = true;

    this.productoService.getProductos().subscribe(
      (result) => {
        this.productos = result.object
        this.formatearImagen();
        this.productosAgrupados = this.agruparProductosPorCategoria(this.productos);
        this.categories = Object.keys(this.productosAgrupados);

      }, error => {
        console.log(error)
      },() => {
        this.isLoading = false;
      }
    );
  }
}
