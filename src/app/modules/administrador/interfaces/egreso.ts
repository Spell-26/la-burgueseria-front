export interface Egreso {
  id:          number;
  fecha:       Date | null | any;
  descripcion: string;
  total:       number;
  categoria:   string;
  deduccionDesde : string;
  soporte:            any;
}
