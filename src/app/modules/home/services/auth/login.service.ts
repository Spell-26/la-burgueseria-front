import { Injectable } from '@angular/core';
import {BehaviorSubject, catchError, map, Observable, tap, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {LoginRequest} from "./loginRequest";
import {EnvService} from "../../../administrador/utils/sharedMethods/env/env.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  currentUserLoginOn : BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentUserData : BehaviorSubject<String> = new BehaviorSubject<String>("");
  constructor(private http: HttpClient, private env : EnvService) {
    this.currentUserLoginOn = new BehaviorSubject<boolean>(sessionStorage.getItem("token") != null);
    this.currentUserData = new BehaviorSubject<String>(sessionStorage.getItem("token") || "");
  }

  login(credentials:LoginRequest):Observable<any>{
    return this.http.post<any>(this.env.urlHost+"/auth/login", credentials).pipe(
      tap(
        (userData) => {
          sessionStorage.setItem("token", userData.token);
          sessionStorage.setItem("nombre", userData.nombre);
          sessionStorage.setItem("apellido", userData.apellido);
          sessionStorage.setItem("rol", userData.rol);

          this.currentUserData.next(userData.token);
          this.currentUserLoginOn.next(true);
        }
      ),
      map(
        (userData) => {
          userData.token
        }
      ), catchError(this.handleError)
    )
  }

  logout():void{
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("nombre");
    sessionStorage.removeItem("apellido");
    sessionStorage.removeItem("rol");
    this.currentUserLoginOn.next(false);

  }

  private handleError(error:HttpErrorResponse){
    if(error.status===0){
      //console.error('Se ha producio un error ', error.error);
    }
    else{
      //console.error('Backend retornó el código de estado ', error);
    }
    return throwError(()=> new Error(''));
  }

  get userData():Observable<String>{
    return this.currentUserData.asObservable();
  }

  get userLoginOn(): Observable<boolean>{
    return this.currentUserLoginOn.asObservable();
  }

  get userToken():String{
    return this.currentUserData.value;
  }
}
