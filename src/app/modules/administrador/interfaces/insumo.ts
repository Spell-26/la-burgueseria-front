export interface insumoResponse {
  mensaje: string;
  object:  insumo[];
}

export interface insumo {
  id:       number;
  nombre:   string;
  cantidad: number;
}
