import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {LoginService} from "../../services/auth/login.service";
import {LoginRequest} from "../../services/auth/loginRequest";
import {AlertasService} from "../../../administrador/utils/sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form : FormGroup = this.fb.group({
    username : [null, [Validators.required]],
    password : [null, [Validators.required]]
  });
  hide: boolean = true;
  loginError : string = "";
  loadingLogin: boolean = false;
  constructor(
    private fb : FormBuilder,
    private router : Router,
    private loginService : LoginService,
    private alertaService : AlertasService
  ) {
  }

  goHome(){
    this.router.navigate(['/home'])
  }

  getUsername(){
    return this.form.controls['username'];
  }
  getPassword(){
    return this.form.controls['password'];
  }

  login(){
    this.loadingLogin = true;
    if(this.form.valid){
      this.loginError = "";
      this.loginService.login(this.form.value as LoginRequest).subscribe(
        result => {
        },
        error => {
          this.loadingLogin = false;
          if(error.status === 403){
            const mensaje = "Los datos de inicio se sesión no han sido correctos."
            this.alertaService.alertaErrorMensajeCustom(mensaje)
          }
          else if(error.status == 409){
            const mensaje = "Ocurrió un error. Por favor, comunícate con un administrador."
            this.alertaService.alertaErrorMensajeCustom(mensaje)
          }
         else{
            const mensaje = "Error interno."
            this.alertaService.alertaErrorMensajeCustom(mensaje)
          }

        },
        () => {
          //TODO: agregar if para que diferencie cuando es admin y cuando es mesero
          //TODO: cuando es mesero se va auto al modulo de pedidos
          this.router.navigateByUrl('/admin');
          this.form.reset();
        }
      )
    }
    else{
      this.form.markAsTouched();
      const mensaje = "Los datos de inicio se sesión no han sido correctos."
      this.alertaService.alertaErrorMensajeCustom(mensaje)
    }
  }
  public recuperarPass(){
    this.router.navigateByUrl('recover');
  }
}
