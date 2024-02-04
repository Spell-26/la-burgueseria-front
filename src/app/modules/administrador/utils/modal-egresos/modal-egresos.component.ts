import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

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
  //imagen del egreso
  fileName = '';
  fileError = '';
  selectedImage: SafeResourceUrl = '';
  imagenUrl: SafeResourceUrl = '';
  imagen: SafeResourceUrl = '';
  constructor(
    public dialogRef : MatDialogRef<ModalEgresosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
    private alertaService : AlertasService,
    private sanitizer : DomSanitizer,
  ) {
    this.form = this.fb.group(
      {
        tipoEgreso : [null, Validators.required],
        egreso: [null, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
        descripcion: [null, Validators.required],
        fecha: [null],
        deduccionDesde : [null, Validators.required],
        soporte : [null]
      }
    );

    //en caso de que se envie datos de quitarán los botones de guardar y y cancelar
    if(data){

      this.form.get('tipoEgreso')?.setValue(data.tipoEgreso);
      this.form.get('deduccionDesde')?.setValue(data.deduccionDesde);
      this.form.get('egreso')?.setValue(data.egreso);
      this.form.get('descripcion')?.setValue(data.descripcion);
      this.form.get('fecha')?.setValue(data.fecha)
      this.form.get('soporte')?.setValue(data.soporte)
      //deshabilitar campos para que no se pueda editar
      this.form.get('tipoEgreso')?.disable();
      this.form.get('egreso')?.disable();
      this.form.get('descripcion')?.disable();
      this.form.get('fecha')?.disable();
      this.form.get('deduccionDesde')?.disable();

      this.deshabilitarBotones = true;

      //tratamiento para la imagen del egreso
      this.formatearImagen();
      this.selectedImage = this.imagenUrl;
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


  //formatear la imagen
  private formatearImagen(){
    this.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.data.soporte);
  }


  descargarImagen(): void {
    const byteCharacters = atob(this.data.soporte);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    // Crea un enlace temporal
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'imagen.jpg'; // Nombre de archivo para la descarga
    document.body.appendChild(link);

    // Dispara el clic en el enlace y elimina el enlace temporal
    link.click();
    document.body.removeChild(link);
  }

  onImageError() {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    this.selectedImage = 'assets/img/placeholder-hamburguesa.png';
  }

  // Función para manejar el cambio de archivo
  onFileChange(event: any) {
    //selecciona el elemento fuente del objeto
    const fileInput = event.target;

    //asegurando que el evento si contenga una imagen
    if(fileInput.files && fileInput.files.length > 0){
      const file = event.target.files[0];

      //verificar que el tamaño de la imagen sea menor a 2mb
      if(file.size <= 5 * 1024 * 1024){ // 2 MB en bytes
        this.form.get('soporte')?.setValue(file);
        this.fileName = fileInput.files[0].name;
        this.fileError = ''; //Limpiar el mensaje de error si estaba presente

        //mostrar la imagen seleccionada
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      }
      else{
        this.fileError = '¡Error!, la imagen del egreso no puede superar los 5mb.'
        // Restablecer el valor del input de archivo para permitir una nueva selección
        fileInput.value = '';
        //limpiar nombre del filename
        this.fileName = '';
        // Limpiar la imagen seleccionada si hay error
        this.selectedImage = '';
      }
    }

  }


}
