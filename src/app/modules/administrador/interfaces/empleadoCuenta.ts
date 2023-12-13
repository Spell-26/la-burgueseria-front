import {Empleado} from "./empleado";
import {Cuenta} from "./cuenta";

export interface EmpleadoCuentaResponse {
  mensaje: string;
  object:  EmpleadoCuenta;
}


export interface EmpleadoCuenta {
  id:       number;
  empleado: Empleado;
  cuenta:   Cuenta;
}
