import { Injectable } from '@angular/core';
import {Observable, Subject, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {EnvService} from "../../../administrador/utils/sharedMethods/env/env.service";
import {UserRegister, Usuario} from "../../../administrador/interfaces/usuario";
import {EmpleadosService} from "../../../administrador/services/empleados.service";

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient, private env : EnvService, private empleadoService : EmpleadosService) { }

  private apiUrl = `${this.env.urlHost}/auth/register`;

  registrarEmpleado(empleadoRegister : UserRegister) : Observable<any>{
    return this.http.post(this.apiUrl, empleadoRegister)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      )
  }
}
