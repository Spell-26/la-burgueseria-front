import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {EnvService} from "../../../administrador/utils/sharedMethods/env/env.service";
import {UserRegister} from "../../../administrador/interfaces/usuario";
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PasswordRecoveryService {
  private apiUrl = `${this.env.urlHost}/auth/users/correo`;
  private _refreshNeeded = new Subject<void>();
  constructor(private http : HttpClient, private env : EnvService) { }

  generateToken(correo : string) : Observable<any>{
    return this.http.get<any>(`${this.apiUrl}/${correo}`);
  }
  validateToken(correo : string , token : string) : Observable<any>{
    return this.http.get(`${this.apiUrl}/${correo}/${token}`);
  }
}
