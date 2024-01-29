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
  fechaHorainicio:      Date | null;
  fechaHoraCierre:      Date | null;
  estadoCaja:           boolean;
}
