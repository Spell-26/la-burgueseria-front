import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-modal-egresos',
  templateUrl: './modal-egresos.component.html',
  styleUrls: ['./modal-egresos.component.css']
})
export class ModalEgresosComponent {

  form : FormGroup;
  tiposEstados  = ["Compra de insumos", "Pago de nómina", "Gastos operativos", "Mantenimiento y reparación", "Impuestos", "Otros"];
  origenDeduccion = ["Caja menor", "Caja mayor"];
  deshabilitarBotones = false;
  constructor(
    public dialogRef : MatDialogRef<ModalEgresosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
    private alertaService : AlertasService,
  ) {
    this.form = this.fb.group(
      {
        tipoEgreso : [null, Validators.required],
        egreso: [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        descripcion: [null, Validators.required],
        fecha: [null],
        deduccionDesde : [null, Validators.required],
      }
    );

    //en caso de que se envie datos de quitarán los botones de guardar y y cancelar
    if(data){

      this.form.get('tipoEgreso')?.setValue(data.tipoEgreso);
      this.form.get('deduccionDesde')?.setValue(data.deduccionDesde);
      this.form.get('egreso')?.setValue(data.egreso);
      this.form.get('descripcion')?.setValue(data.descripcion);
      this.form.get('fecha')?.setValue(data.fecha)
      //deshabilitar campos para que no se pueda editar
      this.form.get('tipoEgreso')?.disable();
      this.form.get('egreso')?.disable();
      this.form.get('descripcion')?.disable();
      this.form.get('fecha')?.disable();
      this.form.get('deduccionDesde')?.disable();

      this.deshabilitarBotones = true;
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
