import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {EnvService} from "../../../administrador/utils/sharedMethods/env/env.service";
import {Observable, Subject, tap} from "rxjs";
import {UserRegister} from "../../../administrador/interfaces/usuario";

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${this.env.urlHost}/auth/users`;
  private _refreshNeeded = new Subject<void>();

  get refreshNeeded(){
    return this._refreshNeeded
  }
  constructor(private http : HttpClient, private env : EnvService) { }

  getAllUsers():Observable<any>{
    return this.http.get<any>(this.apiUrl);
  }

  actualizarEmpleado(empleadoUpdate : UserRegister) : Observable<any>{
    return this.http.put(this.apiUrl, empleadoUpdate)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
  actualizarEstadoUsuario(usuario : UserRegister) : Observable<any>{
    return this.http.patch(`${this.apiUrl}/status`, usuario)
      .pipe(
        tap(
          () => {
            this._refreshNeeded.next();
          }
        )
      );
  }
}
