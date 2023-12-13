import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-modal-ingresos',
  templateUrl: './modal-ingresos.component.html',
  styleUrls: ['./modal-ingresos.component.css']
})
export class ModalIngresosComponent {
  form : FormGroup;
  metodosPago  = ["Efectivo", "Transferencia"];

  constructor(
    public dialogRef : MatDialogRef<ModalIngresosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
  ) {
    this.form = this.fb.group(
      {
        metodoPago : [null, Validators.required]
      }
    )
  }


  onSubmit(){
    if(this.form.valid){
      this.dialogRef.close(this.form.value)
    }
  }
}
