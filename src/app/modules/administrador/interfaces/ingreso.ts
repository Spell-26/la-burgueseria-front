import {Cuenta} from "./cuenta";

export interface Ingreso {
  id:         number;
  fecha:      Date | null | any;
  metodoPago: string;
  total:      number;
  cuenta:     Cuenta;
}
