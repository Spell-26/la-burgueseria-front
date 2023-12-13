export interface EstadoCuentaResponse {
  mensaje: string;
  object:  EstadoCuenta[];
}

export interface EstadoCuenta {
  id:     number;
  nombre: string;
}
