import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-modal-lateral',
  templateUrl: './modal-lateral.component.html',
  styleUrls: ['./modal-lateral.component.css', '../styles/estilosCompartidos.css']
})
export class ModalLateralComponent {
  form: FormGroup;
  tituloModal: string;

  constructor(
    public dialogRef: MatDialogRef<ModalLateralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({});
    this.tituloModal = data.titulo || 'Modal'; // Usa el título proporcionado o un valor predeterminado

    // Agregar campos dinámicamente
    if (data && data.campos) {
      data.campos.forEach((campo: any) => {
        const validators = campo.validadores || [];
        this.form.addControl(campo.nombre, this.fb.control('', validators));


        // Agregar opciones para campos de tipo 'selector'
        if (campo.tipo === 'selector' && campo.opciones) {
          this.form.get(campo.nombre)?.setValue(campo.opciones[0]); // Puedes establecer un valor predeterminado si lo deseas
        }

      });
    }
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
