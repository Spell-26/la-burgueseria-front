import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatDialogRef } from "@angular/material/dialog";
import { InsumosService } from "../../services/insumos.service";
import { map, Observable, startWith } from "rxjs";
import {insumo} from "../../interfaces";
import {Egreso} from "../../interfaces/egreso";
import {EgresoService} from "../../services/egreso.service";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-modal-agregar-insumo',
  templateUrl: './modal-agregar-insumo.component.html',
  styleUrls: ['./modal-agregar-insumo.component.css']
})
export class ModalAgregarInsumoComponent implements OnInit {
  insumos: string[] = [];
  filteredOptions: Observable<string[]> | undefined;
  nombreControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(40),
    Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)
  ]);
  cantidadControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d+$/), // solo valores numéricos enteros
    Validators.min(1) // la cantidad debe ser mayor a 0
  ]);
  precioUnitarioControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d+$/), // solo valores numéricos enteros
    Validators.min(50), // la cantidad debe ser mayor a 0
    Validators.max(3000000)
  ]);
  totalCompraControl = new FormControl('',[
    Validators.required,
    Validators.pattern(/^\d+$/), // solo valores numéricos enteros
    Validators.min(50) // la cantidad debe ser mayor a 0
    ]);
  origenControl = new FormControl(null, [
    Validators.required
  ]);

  imagenControl = new FormControl();
  //form con todos los campos
  form = new FormGroup({
    totalCompra : this.totalCompraControl,
    origen: this.origenControl,
    imagen: this.imagenControl
  });

  //flag para verificar la carga de los datos
  isLoading = true;
  //flag para saber cuando se esta agregando un insumo a stagging
  isAgregandoInsumo = false;
  //staging insumos
  insumosAGuardar : insumo[] = [];
  //error agregar insumo
  errorAgregarInsumo = false;
  //origen de salida del dinero
  origenDeduccion : string[] = ['Caja menor', 'Caja mayor']
  //imagen del egreso
  fileName = '';
  fileError = '';
  selectedImage: SafeResourceUrl = '';
  imagenUrl: SafeResourceUrl = '';
  imagen: SafeResourceUrl = '';

  constructor(
    public dialogRef: MatDialogRef<ModalAgregarInsumoComponent>,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private insumoService: InsumosService,
    private egresoService : EgresoService,
    private alertaService : AlertasService
  ) {
  }

  ngOnInit(): void {
    this.getInsumos();

    this.insumoService.refreshNeeded.subscribe(
      () => {
        this.getInsumos();
      }
    );

    // Verificamos si el control del formulario "nombre" existe antes de acceder a sus propiedades

    this.filteredOptions = this.nombreControl.valueChanges
        .pipe(
          // @ts-ignore
          startWith(''),
          map((value: string) => this._filter(value))
        );

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public onSubmit(){
    if(this.form.valid){
      //crear la descripcion del egreso
      const descripcion = this.descripcionEgreso(this.insumosAGuardar);
      //construir el objeto egreso

      const egreso : Egreso = {
        id : 0,
        // @ts-ignore
        total : this.totalCompraControl.value?.toString(),
        categoria: 'Compra de insumos',
        // @ts-ignore
        deduccionDesde: this.origenControl.value,
        soporte : this.imagenControl.value,
        fecha : null,
        descripcion : descripcion
      }

      this.alertaService.alertaPedirConfirmacionCrear().then(
        (result) => {
          if(result.isConfirmed)
          {
            //crear el egreso:
            this.egresoService.crearEgreso(egreso).subscribe(
              ()=>{},
              error => {
                console.log(error)
              },
              () => {
                this.alertaService.alertaConfirmarCreacion();
              }
            );
            this.insumosAGuardar.forEach(insumo => {
              this.insumoService.crearInsumo(insumo).subscribe();
            })
            this.dialogRef.close();
          }
        }
      );


    }

  }
  //funcion para construir la descripcion
  private descripcionEgreso(insumos : insumo[]): string{
    let descripcion = 'Se realizó la compra de los siguientes insumos:';
    //recorrer el array de insumos para crear la descripcion
    insumos.forEach(insumo => {
      const texto = ` ${insumo.nombre} x${insumo.cantidad}`
      descripcion += texto
    });
    descripcion += '.';
    return descripcion;
  }

  //manejo de la imagen del egreso
  onImageError() {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    this.selectedImage = 'assets/img/placeholder-hamburguesa.png';
  }
  // Función para manejar el cambio de archivo
  onFileChange(event: any) {
    // Seleccionar el elemento fuente del objeto
    const fileInput = event.target;

    // Asegurar que el evento contenga un archivo
    if (fileInput.files && fileInput.files.length > 0) {
      const file = event.target.files[0];

      // Verificar que el tamaño de la imagen sea menor o igual a 5 MB
      if (file.size <= 5 * 1024 * 1024) { // 5 MB en bytes
        // Validar el tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          this.fileError = 'Error: El archivo seleccionado no es una imagen válida.';
          // Restablecer el valor del input de archivo para permitir una nueva selección
          fileInput.value = '';
          // Limpiar el nombre del filename
          this.fileName = '';
          // Limpiar la imagen seleccionada si hay error
          this.selectedImage = '';
          return; // Salir de la función si el tipo de archivo no es válido
        }

        // Establecer el archivo seleccionado en el control de imagen
        this.imagenControl.setValue(file);
        this.fileName = fileInput.files[0].name;
        this.fileError = ''; // Limpiar el mensaje de error si estaba presente

        // Mostrar la imagen seleccionada en un elemento <img>
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      } else {
        this.fileError = '¡Error!, la imagen del egreso no puede superar los 5MB.'
        // Restablecer el valor del input de archivo para permitir una nueva selección
        fileInput.value = '';
        // Limpiar el nombre del filename
        this.fileName = '';
        // Limpiar la imagen seleccionada si hay error
        this.selectedImage = '';
      }
    }
  }


  //fin del manejo de la imagen del egreso

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.insumos.filter(option => option.toLowerCase().includes(filterValue));
  }
  public changeIsAgregandoInsumo(){
    this.isAgregandoInsumo = !this.isAgregandoInsumo;
  }
  //agregar insumo al stagging
  public async agregarAlStagging() {
    //crear instancia del insumo
    if (this.nombreControl.value != '' && this.cantidadControl.value != '' && this.precioUnitarioControl.value != '') {

      const insumo: insumo = {
        id: 0,
        // @ts-ignore
        nombre: this.nombreControl.value,
        // @ts-ignore
        cantidad: this.cantidadControl.value,
        // @ts-ignore
        precioCompraUnidad: this.precioUnitarioControl.value
      }
      //consultar a la api si existe un insumo con el mismo nombre
      //si existe añadir al objeto insumo el valor de su precio compra unitario
      const data = await this.insumoService.buscarPorNombre(insumo.nombre).toPromise();

      if(data?.object[0]){
        insumo.precioCompraUnidadAntiguo = data?.object[0].precioCompraUnidad
      }else{
        insumo.precioCompraUnidadAntiguo = undefined;
      }
      insumo.porcentaje = this.calcularCambioPrecio(insumo);


      this.errorAgregarInsumo = false;

      //agregar el insumo al staggin
      this.insumosAGuardar.push(insumo);
      //ocultar ventana y resetear formulario
      this.nombreControl.setValue('');
      this.cantidadControl.setValue('');
      this.precioUnitarioControl.setValue('');
      this.isAgregandoInsumo = false;
    } else {
      this.errorAgregarInsumo = true;
    }

  }

  //Quitar un insumo del array
  public quitarInsumo(i : number) {
    this.insumosAGuardar.splice(i, 1);
  }

  //PETICIONES HTTP
  private getInsumos() {
    this.isLoading = true;
    this.insumoService.getInsumos()
      .subscribe(
        (result) => {
          const insumosObj = result.object;
          this.insumos = [];
          insumosObj.forEach(insumo => {
            this.insumos.push(insumo.nombre)
          })
        }, error => {
          console.log(error)
        },
        () => {
          this.isLoading = false;
        }
      );
  }


  public calcularCambioPrecio(insumoDto: insumo): string {
    if (insumoDto.precioCompraUnidad === undefined || (insumoDto.precioCompraUnidadAntiguo === undefined || insumoDto.precioCompraUnidadAntiguo == 0)) {
      return ''; // Manejar el caso donde faltan datos
    }

    const precioNuevo = insumoDto.precioCompraUnidad;
    const precioAntiguo = insumoDto.precioCompraUnidadAntiguo;

    if (precioNuevo === precioAntiguo) {
      return '0%';
    }

    const cambioPorcentaje = ((precioNuevo - precioAntiguo) / precioAntiguo) * 100;
    const cambioRedondeado = Math.round(cambioPorcentaje); // Redondear el porcentaje

    if (cambioRedondeado > 0) {
      return `+${cambioRedondeado}%`;
    } else {
      return `${cambioRedondeado}%`;
    }
  }

}

