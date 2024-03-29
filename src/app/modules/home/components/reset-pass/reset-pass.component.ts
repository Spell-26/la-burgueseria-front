import {Component, OnInit} from '@angular/core';
import emailjs from '@emailjs/browser';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {PasswordRecoveryService} from "../../services/auth/password-recovery.service";
import {UserRegister} from "../../../administrador/interfaces/usuario";
import Swal from "sweetalert2";
import {EnvService} from "../../../administrador/utils/sharedMethods/env/env.service";
import {AlertasService} from "../../../administrador/utils/sharedMethods/alertas/alertas.service";
import {UsuarioService} from "../../services/usuario/usuario.service";


@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent implements OnInit{
  form : FormGroup = this.fb.group({
    fromEmail: ['', [Validators.required, Validators.email]]
  });

  formToken : FormGroup = this.fb.group({
    token : [null, [Validators.required]]
  });

  formPassword : FormGroup = this.fb.group({
    password : [null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])/)]],
    confirmPassword : [null, [Validators.required]]
  })

  public isInputStarted : boolean = false;
  public correoUsuario : string | undefined ;
  public startChangingPassword : boolean = false;
  constructor(private fb : FormBuilder,
              private router : Router,
              private passwordRecoveryService : PasswordRecoveryService,
              private ruta : ActivatedRoute,
              private env : EnvService,
              private alertaService : AlertasService,
              private usuarioService : UsuarioService) {
  }

  ngOnInit(): void {
    this.ruta.params.subscribe(params => {
      this.correoUsuario = params['correoUsuario']
    })
  }
  async send() {
    let usuario! : UserRegister;
    //enviar peticion
    this.passwordRecoveryService.generateToken(this.form.value.fromEmail)
      .subscribe(
        async (response) => {

          usuario = response.object;
          let url = this.env.getFontUrl() + "/home/login/recover/"+usuario.correo;
          if (usuario != null) {
            emailjs.init('EbTGCiO4A6RdM0GMb')
            let response = await emailjs.send("service_szz57t2", "template_hwvejf2", {
              to_name: usuario.nombre + " " + usuario.apellido,
              token: usuario.token,
              to_email: usuario.correo,
              url: url,
            });
            this.form.reset()
          }
          this.alertaEnviarMail();
        }
      )



  }

  public validarToken(){
    this.passwordRecoveryService.validateToken(this.correoUsuario!, this.formToken.value.token)
      .subscribe(
        result => {
          this.startChangingPassword = true;
        }, error => {
          if(error.status === 409){
            const mensaje : string = "¡Token inválido!"
            this.alertaService.alertaErrorMensajeCustom(mensaje);
          }
        }
      )
  }

  public cambiarContrasenna(){
    if(this.formPassword.value.password === this.formPassword.value.confirmPassword){
      let usuario : UserRegister;
      this.passwordRecoveryService.generateToken(this.correoUsuario!)
        .subscribe(
          result => {
            usuario = result.object;
            //asignar nueva contraseña al objeto
            usuario.password = this.formPassword.value.password;

            this.usuarioService.actualizarEmpleado(usuario)
              .subscribe(
                result => {
                 this.alertaCambioExitoso()
                },
                error => {
                  const mensaje :string = "Ha ocurrido un error en el cambio de contraseña";
                  this.alertaService.alertaErrorMensajeCustom(mensaje);
                }
              )
          }
        )
    }
  }

  goToHome(){
    this.router.navigate(['/home'])
  }
  inputStarted(){
    this.isInputStarted = true;
  }

  private alertaEnviarMail(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "¡Hecho!",
      icon: 'success',
      color: 'white',
      timer: 5000,
      html: "<p>Se enviará un correo electrónico con el " +
        "código de recuperación en caso de que este correo este registrado en nuestro sistema.</p>",
      timerProgressBar: true,
      position: 'center', // Esquina inferior derecha
      showConfirmButton: false, // Ocultar el botón de confirmación
      background: '#1e1e1e', // Fondo oscuro
      didOpen: () => {
        Swal.showLoading();
        // @ts-ignore
        const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
        timerInterval = setInterval(() => {
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 5000;

        }, 500);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      this.router.navigate(['/home/login'])
    });
  }

  private alertaCambioExitoso(){
    let timerInterval: any;
    // @ts-ignore
    Swal.fire({
      title: "¡Hecho!",
      icon: 'success',
      color: 'white',
      timer: 5000,
      html: "<p>Se ha modificado la contraseña exitosamente!</p>",
      timerProgressBar: true,
      position: 'center', // Esquina inferior derecha
      showConfirmButton: false, // Ocultar el botón de confirmación
      background: '#1e1e1e', // Fondo oscuro
      didOpen: () => {
        Swal.showLoading();
        // @ts-ignore
        const timer: any = Swal.getPopup().querySelector(".dark-mode-timer");
        timerInterval = setInterval(() => {
          // @ts-ignore
          const remainingSeconds = Swal.getTimerLeft() / 5000;

        }, 500);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      this.router.navigate(['/home/login'])
    });
  }

}
