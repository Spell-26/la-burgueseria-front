export interface Usuario{
  id:number;
  nombre?:string;
  apellido?: string;
  username: string;
}
export interface UserRegister{
  id:number;
  nombre: string;
  apellido : string;
  username: string;
  password?: string;
  rol : string;
  estado?: boolean;
  correo : string;
}
