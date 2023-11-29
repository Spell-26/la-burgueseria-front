import {Mesa} from "./mesa";

export interface QrResponse {
  mensaje: string;
  object:  Qr[];
}

export interface Qr {
  id:   number;
  ruta: string;
  url:  string;
}
