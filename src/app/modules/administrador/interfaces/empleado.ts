export interface EmpleadoResponse {
  mensaje: string;
  object:  Empleado[];
}

export interface Empleado {
  id:        number;
  documento: string;
  nombre:    string;
  apellido:  string;
  estado:    boolean | null;
}
