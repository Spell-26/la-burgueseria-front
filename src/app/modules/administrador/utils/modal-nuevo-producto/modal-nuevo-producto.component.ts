import {Component, ElementRef, HostListener, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoriaProducto, InsumoProducto, Producto} from "../../interfaces";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CategoriaProductoService} from "../../services/categoria-producto.service";
import {ModalIppComponent} from "../modal-ipp/modal-ipp.component";
import {ModalAgregarCategoriaComponent} from "../modal-agregar-categoria/modal-agregar-categoria.component";
import Swal, {SweetAlertResult} from "sweetalert2";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-modal-nuevo-producto',
  templateUrl: './modal-nuevo-producto.component.html',
  styleUrls: ['./modal-nuevo-producto.component.css']
})
export class ModalNuevoProductoComponent implements OnInit {

  form : FormGroup;
  categorias : CategoriaProducto[] = [];
  isSubmitDisabled: boolean = false;
  insumos : InsumoProducto[] = [];

  //categoria seleccionada
  categoriaSeleccionada : CategoriaProducto | undefined;
  //nombre de la imagen
  fileName = '';
  //mostrar incono indicativo
  showScrollIcon : boolean = true;
  //variables de los insumos
  //guardar insumo por producto
  isEditable: boolean = false;
  cantidadEditada : number = 0;
  insumoPorProductoEditandoIndex : number | null = null;
  //mensaje de error si la imagen del producto excede los 2mb
  fileError = '';
  //src de la imagen seleccionada
  selectedImage = '';
  //listener para el selector
  menuDesplegado = false;
  // Variable para almacenar la descripción
  descripcionValue: string = '';
  constructor(
    public dialogRef: MatDialogRef<ModalNuevoProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data : any,
    private fb : FormBuilder,
    private categoriaProductoService : CategoriaProductoService,
    public dialog : MatDialog,
    private el: ElementRef,
    private alertasService : AlertasService,
  ) {
    this.form = this.fb.group({
      nombre: [null, [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      precio: [null,[Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
      imagen: [null],
      descripcion: ['', [Validators.required, Validators.maxLength(150)]],
      categoria: ['', Validators.required]
    });
    this.form.statusChanges.subscribe(
      (status) => {
        this.isSubmitDisabled = status === 'INVALID';
      }
    );
  }


  ngOnInit(): void {
    this.categoriaProductoService.refreshNeeded
      .subscribe(
        () => {
          this.getCategorias();
        }
      );
    this.getCategorias();


    this.mostrarIconoScroll()
  }

  //METODOS
  onNoClick(): void {
    this.dialogRef.close();
  }
  onGuardarClick(){
    const producto : Producto = {
      id: 0,
      nombre: this.form.value.nombre,
      precio: this.form.value.precio,
      imagen: this.form.value.imagen,
      imagenUrl: null,
      descripcion: this.form.value.descripcion,
      categoriaProducto: this.form.value.categoria,
    }

    //guardar el instancia del producto y los ingredientes en un solo objeto
    const result = {
      producto: producto,
      ingredientes : this.insumos,
    }

    this.dialogRef.close(result);
  }

  private mostrarIconoScroll(){
    //MOSTRAR EL ICONO DURANTE 5 SEGUNDOS
    this.showScrollIcon = true;
    setTimeout(
      () => {
        this.showScrollIcon = false;
      }, 5000
    )
  }

  onSubmit() {
    if(this.form.valid){
      const datosAEnviar = {
        //INSTANCIAS DE OBJETOS A ENVIAR AL COMPONENTE PRINCIPAL
      }
      this.dialogRef.close(datosAEnviar);
    }
  }

  //seleccionar categoria cuando se selecciona
  onCategoriaSeleccionada(event: any): void {
    const categoriaSelect = event.value;
    this.categoriaSeleccionada = categoriaSelect;
    this.menuDesplegado = false;
  }
  //saber cuando el selector esta desplegado

  onMenuDesplegado(event: any): void {
    this.menuDesplegado = event;
  }


  // selecciona imagen
  onFileChange(event: any): void {
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Verificar si el tamaño del archivo es menor o igual a 2 MB
      if (file.size <= 5 * 1024 * 1024) { // 2 MB en bytes
        this.form.get('imagen')?.setValue(file);
        this.fileName = fileInput.files[0].name;
        this.fileError = ''; // Limpiar el mensaje de error si estaba presente

        //mostrar la imagen seleccionada
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target?.result as string;
        };

        reader.readAsDataURL(file);
      } else {
        this.fileError = '¡Error!, la imagen del producto no puede superar los 5mb.'
        // Restablecer el valor del input de archivo para permitir una nueva selección
        fileInput.value = '';
        //limpiar nombre del filename
        this.fileName = '';
        // Limpiar la imagen seleccionada si hay error
        this.selectedImage = '';
      }
    }
  }


  //metodos de los insumos del producto
  iniciarEdicion(index : number){
    this.isEditable = true;
    this.cantidadEditada = this.insumos[index].cantidad;
    this.insumoPorProductoEditandoIndex = index;
  }
  terminarEdicion(index:number){
    this.isEditable = false;
    this.insumoPorProductoEditandoIndex = null;
    this.cantidadEditada = 0;
  }
  onCantidadChange(event : any){
    this.cantidadEditada = event.target.value;
  }
  guardarIpp(index: number){

    this.insumos[index].cantidad = this.cantidadEditada;

    this.terminarEdicion(index);
  }

  //eliminar ipp
  eliminarIpp(index : number){
    this.insumos.splice(index, 1);
  }

  //boton para eliminar una categoria
  quitarCategoria(categoria: any): void {
    this.alertasService.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){
            //proceder a eliminar la categoria
            this.categoriaProductoService.deleteCategoria(categoria.id)
              .subscribe(
                result => {
                  //refrescar las categorias
                  this.getCategorias();
                },
                error => {
                  console.log(error);
                }
              )

            this.alertasService.alertaEliminadoCorrectamente();

          }else if(result.dismiss === Swal.DismissReason.cancel ){
            this.alertasService.alertaSinModificaciones();
          }
        }
      );
  }

  //caracteres disponibles en la dewscripcion
  onDescripcionInput(event: Event) {
    const descripcionControl = this.form.get('descripcion');
    const value = (event.target as HTMLInputElement).value;

    // Almacenar la descripción en la variable aparte
    this.descripcionValue = value;

    // Verificar si se supera la longitud máxima
    if (this.descripcionValue.length > 150) {
      // Truncar la descripción si es necesario y asignarla al control del formulario
      descripcionControl?.setValue(this.descripcionValue.slice(0, 150), { emitEvent: false });
    }
  }




  //PETICIONES HTTP
  private getCategorias() {
    this.categoriaProductoService.getCategoriasProductos()
      .subscribe(
        data => {
          this.categorias = data.object
        },
        error => {
          console.log(error);
        }
      )
  }

  //MODALES
  modalNuevaCategoria(){
    const dialogRef = this.dialog.open(ModalAgregarCategoriaComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '300px',
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if(result){
          this.getCategorias();
        }
      }
    );
  }

  modalAgregarInsumo() : void {
    const dialogRef = this.dialog.open(ModalIppComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '400px',
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if(result){
          //validar que no esté ya un objeto con el mismo ID agregado al array
          if(!this.insumos.some(insumo => insumo.insumo.id === result.insumo.id)){
            this.insumos.push(result);
            this.mostrarIconoScroll()
          }
        }
      }
    )
  }
}
