import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-modal-insumos',
  templateUrl: './modal-insumos.component.html',
  styleUrls: ['./modal-insumos.component.css', '../../utils/styles/estilosCompartidos.css']
})
export class ModalInsumosComponent {
  form: FormGroup;
  isSubmitDisabled: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<ModalInsumosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      cantidad: [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
    });
    this.form.statusChanges.subscribe(
      (status) =>{
        this.isSubmitDisabled = status === 'INVALID';
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Aquí puedes realizar acciones con los datos del formulario
      console.log(this.form.value);
      this.dialogRef.close();
    }
  }
}
