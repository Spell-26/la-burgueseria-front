import {Mesa} from "./mesa";

export interface Cuenta {
  id:           number;
  mesa:         Mesa;
  estadoCuenta: EstadoCuenta;
  fecha:        Date | null | any;
  total:        number;
  abono:        number;
}
export interface EstadoCuenta {
  id:     number;
  nombre: string;
}
