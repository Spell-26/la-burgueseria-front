import {Component, OnInit} from '@angular/core';
import {ProductoResponse} from "../../interfaces/producto";
import {ProductosService} from "../../services/productos.service";

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ProductosComponent  implements OnInit{
  //  VARIABLES
  public productos ?: ProductoResponse;
  // CONSTRUCTOR E INICIALIZADORES
  constructor(private productosService : ProductosService) {
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
  //*******PETICIONES HTTP*******
  //****************************
  public getAllProductos(){
    this.productosService.gerProductos()
      .subscribe(
        producto => {
          this.productos = producto;
        }
      );
  }

}
