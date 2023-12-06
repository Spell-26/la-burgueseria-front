export interface EmpleadoResponse {
  mensaje: string;
  object:  Empleado[];
}

export interface Empleado {
  id:        number;
  documento: number;
  nombre:    string;
  apellido:  string;
  estado:    boolean | null;
}
