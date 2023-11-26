import {insumo} from "./insumo";
import {Producto} from "./producto";


export interface InsumoProductoResponse {
  mensaje: string;
  object:  InsumoProducto[];
}
export interface InsumoProducto {
  id:       number;
  cantidad: number;
  insumo:   insumo;
  producto: Producto;
}
