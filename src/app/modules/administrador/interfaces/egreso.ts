export interface Egreso {
  id:          number;
  fecha:       Date | null;
  descripcion: string;
  total:       number;
  categoria:   string;
  deduccionDesde : string;
}
