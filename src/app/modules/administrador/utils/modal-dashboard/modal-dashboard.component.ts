import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-modal-dashboard',
  templateUrl: './modal-dashboard.component.html',
  styleUrls: ['./modal-dashboard.component.css']
})
export class ModalDashboardComponent {

  public tituloModal = "Iniciar día.";
  form : FormGroup;
  deshabilitarBotones = false;
  isIniciarDia : boolean = true;

  constructor(
    public dialogRef : MatDialogRef<ModalDashboardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
    private alertaService : AlertasService,
  ) {

    this.form = this.fb.group({
      totalCalculado : [null],
      totalReportado : [null],
      saldoInicioCajaMenor : [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
      observaciones : [null],
      fechaHoraInicio : [null],
      fechaHoraCierre : [null],
      estadoCaja: [null]
    });

    if(data){
      this.isIniciarDia = data.isIniciarDia;

      this.form = this.fb.group({
        totalCalculado : [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        totalReportado : [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        saldoInicioCajaMenor : [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        observaciones : [null, Validators.required],
        fechaHoraInicio : [null],
        fechaHoraCierre : [null],
        estadoCaja: [null]
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
}
