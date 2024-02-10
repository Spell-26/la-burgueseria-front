export interface GestionCajaResponse{
  mensaje : string;
  object : any;
}

export interface GestionCaja {
  id:                   number;
  totalCalculado:       number;
  totalReportado:       number;
  saldoInicioCajaMenor: number;
  observaciones:        string;
  fechaHorainicio:      Date | null | any;
  fechaHoraCierre:      Date | null;
  estadoCaja:           boolean;
}
