import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-modal-egresos',
  templateUrl: './modal-egresos.component.html',
  styleUrls: ['./modal-egresos.component.css']
})
export class ModalEgresosComponent {

  form : FormGroup;
  tiposEstados  = ["Compra de insumos", "Pago de nomina", "Gastos operativos", "Mentenimiento y reparación", "Impuestos", "Otros"];

  constructor(
    public dialogRef : MatDialogRef<ModalEgresosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
  ) {
    this.form = this.fb.group(
      {
        tipoEgreso : [null, Validators.required],
        egreso: [null, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      }
    );

  }

  onSubmit(){
    if(this.form.valid){
      this.dialogRef.close(this.form.value)
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }


}
