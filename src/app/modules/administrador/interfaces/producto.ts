import {CategoriaProducto} from "./categoriaProducto";

export interface ProductoResponse {
  mensaje: string;
  object:  Producto[];
}

export interface Producto {
  id:                number;
  nombre:            string;
  precio:            number;
  imagen:            any;
  descripcion:       string;
  categoriaProducto: CategoriaProducto | null;
}
