import {Cuenta} from "./cuenta";
import {Producto} from "./producto";
import {EmpleadoCuenta} from "./empleadoCuenta";

export interface ProductoCuentaResponse {
  mensaje: string;
  object:  ProductoCuenta;
}

export interface ProductoCuenta {
  id:       number;
  cuenta:   Cuenta | null;
  producto: Producto;
  cantidad: number;
  valorProducto : number;
  estado:    string;
}
