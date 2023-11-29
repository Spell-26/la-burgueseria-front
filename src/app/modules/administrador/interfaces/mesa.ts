import {Qr} from "./codigoQr";


export interface MesaResponse {
  mensaje: string;
  object:  Mesa[];
}

export interface Mesa {
  id:         number;
  numeroMesa: number;
  qr:         Qr | null;
  estado: string;
}




