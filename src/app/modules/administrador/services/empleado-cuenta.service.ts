import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, Subject, tap} from "rxjs";
import {EmpleadoCuenta} from "../interfaces/empleadoCuenta";

@Injectable({
  providedIn: 'root'
})
export class EmpleadoCuentaService {

  private _refreshNeeded = new Subject<void>();

  private apiUrl = 'http://localhost:8080/api/v1/empleado-cuenta';

  get refreshNeeded(){
    return this._refreshNeeded
  }

  constructor(private http : HttpClient) { }

  //CREAR EMPLEADO POR CUENTA
  public crearEmpleadoCuenta(empleadoCuenta : EmpleadoCuenta) : Observable<any>{
    return this.http.post(this.apiUrl, empleadoCuenta)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }

  // BUSCAR EMPLEADO CUENTA POR ID DE CUENTA
  public empleadoCuentaByCuentaId(id : number) : Observable<any>{
    return this.http.get(`${this.apiUrl}/cuenta/${id}`)
  }

  //OBTENER TODOS LOS EMPLEADOS CUENTA
  public getEmpleadoCuenta() : Observable<any>{
    return this.http.get(this.apiUrl)
  }
}
