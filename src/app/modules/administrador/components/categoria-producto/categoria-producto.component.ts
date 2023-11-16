import {Component, OnInit} from '@angular/core';
import {CategoriaProducto, CategoriaProductoResponse} from "../../interfaces/categoriaProducto";
import {CategoriaProductoService} from "../../services/categoria-producto.service";
import Swal from "sweetalert2";

@Component({
  selector: 'app-categoria-producto',
  templateUrl: './categoria-producto.component.html',
  styleUrls: ['./categoria-producto.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class CategoriaProductoComponent implements OnInit{

  public categoriasProductos?: CategoriaProductoResponse;
  ngOnInit(): void {
    this.categoriaProductoService.refreshNeeded
      .subscribe(
        () => {
          this.getAllCategoriasProductos();
        }
      );
    this.getAllCategoriasProductos();
  }
  constructor(private categoriaProductoService : CategoriaProductoService) {
  }

  //****************************
  //*******MÉTODOS*******
  //****************************
  //CREAR NUEVA CATEGORIA
  modalNuevaCategoria(){
    Swal.fire({
      title: 'Crear Una Nueva Categoría',
      html:
        '<input id="nombre" class="swal2-input" placeholder="Nombre de la categoría">',
      focusConfirm: false,
      preConfirm: () => {
        const nombreCategoria = (document.getElementById('nombre') as HTMLInputElement).value;

        if (!nombreCategoria) {
          Swal.showValidationMessage('Por favor, ingresa un nombre para la categoría');
        }
        else {

          const categoriaProductoSave : CategoriaProducto = {
            id: 0,
            nombre: nombreCategoria
          }

          this.categoriaProductoService.crearCategoria(categoriaProductoSave)
            .subscribe(
              (respuesta) =>{
                Swal.fire('Éxito', 'Categoría agregada correctamente', 'success');

              },
              (error) =>{
                Swal.fire('Error', 'Hubo un problema al agregar la categoría', 'error');
              }
            );
        }
      },
    });
  }



  //****************************
  //*******PETICIONES HTTP*******
  //****************************

  private getAllCategoriasProductos(){
    this.categoriaProductoService.getCategoriasProductos()
      .subscribe(
        categoriaProducto =>{
          this.categoriasProductos = categoriaProducto;
        }
      )
  }
  public deleteCategoria(id :number):void{
    this.categoriaProductoService.deleteCategoria(id)
      .subscribe();
  }

}
