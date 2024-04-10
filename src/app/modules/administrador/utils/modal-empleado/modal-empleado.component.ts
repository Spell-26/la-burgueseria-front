import {Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";
import {ErrorStateMatcher} from "@angular/material/core";

@Component({
  selector: 'app-modal-empleado',
  templateUrl: './modal-empleado.component.html',
  styleUrls: ['./modal-empleado.component.css']
})
export class ModalEmpleadoComponent {
  //cargos
  cargos = ["MESERO", "ADMINISTRADOR"];
  form : FormGroup;
  hide : boolean = true;
  mostrarCamposContrasena: boolean = false;


  constructor(
    public dialogRef : MatDialogRef<ModalEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
    private alertaService : AlertasService,
  ) {
    if(data){
      this.form = this.fb.group(
        {
          documento: [data.empleado.documento, [Validators.required, Validators.pattern(/^[0-9]{7,11}$/), Validators.pattern(/.*/)]],
          nombre: [data.empleado.nombre, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/), Validators.pattern(/.*/)]],
          apellido: [data.empleado.apellido, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/), Validators.pattern(/.*/)]],
          correo: [data.usuario.correo, [Validators.required, Validators.email]],
          rol : [data.usuario.rol, Validators.required]
        }
      );
      this.form.get('documento')?.disable();
    }else{
      this.mostrarCamposContrasena = true;
      this.form = this.fb.group(
        {
          documento: [null, [Validators.required, Validators.pattern(/^[0-9]{7,11}$/), Validators.pattern(/.*/)]],
          nombre: [null, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/), Validators.pattern(/.*/)]],
          apellido: [null, [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚ\s]+$/), Validators.pattern(/.*/)]],
          correo: ['', [Validators.required, Validators.email]],
          contrasena: [null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z]).{8,}$/), Validators.pattern(/.*/)]],
          contrasenaVerify: [null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[a-z]).{8,}$/), Validators.pattern(/.*/)]],
          rol : [null, Validators.required]

        }
      );
      // Suscribirse a los cambios en contrasenaVerify para verificar la coincidencia de contraseñas
      this.form.get('contrasenaVerify')?.valueChanges.subscribe(() => {
        this.verifyPasswordMatch();
      });
    }

  }

  onSubmit(){
    if(this.form.valid){

      //Mostrar alerta de confirmacion
      this.alertaService.alertaPedirConfirmacionCrear()
        .then(
          (result) => {
            if(result.isConfirmed){
              //en caso de ser acertiva cierra el modal y envia los datos al componente padre
              this.dialogRef.close(this.form.value)
            }
          }
        )

    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSlideToggleChange() {
    this.mostrarCamposContrasena = !this.mostrarCamposContrasena; // Invertimos el valor para mostrar los campos de contraseña si el slide toggle está desactivado
    if (!this.mostrarCamposContrasena) {
      // Si el slide está activo, eliminar los campos de contraseña del formulario
      this.form.removeControl('contrasena');
      this.form.removeControl('contrasenaVerify');
    } else {
      // Si el slide está desactivado, agregar los campos de contraseña al formulario
      this.form.addControl('contrasena', this.fb.control('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\/\-])[A-Za-z\d@$!%*?&+\/\-]{8,}$/)]));
      this.form.addControl('contrasenaVerify', this.fb.control('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+\/\-])[A-Za-z\d@$!%*?&+\/\-]{8,}$/)]));

    }
  }

  // Función para verificar la coincidencia de contraseñas
  verifyPasswordMatch(): void {
    const contrasena = this.form.get('contrasena')?.value;
    const contrasenaVerify = this.form.get('contrasenaVerify')?.value;

    if (contrasena !== contrasenaVerify) {
      this.form.get('contrasenaVerify')?.setErrors({ mismatch: true });
    } else {
      this.form.get('contrasenaVerify')?.setErrors(null);
    }
  }

}



/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
