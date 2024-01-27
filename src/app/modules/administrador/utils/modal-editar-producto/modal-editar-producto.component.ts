import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CategoriaProducto, insumo, InsumoProducto} from "../../interfaces";
import {DomSanitizer} from "@angular/platform-browser";
import {Producto} from "../../interfaces/producto";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {ModalIppComponent} from "../modal-ipp/modal-ipp.component";
import {CategoriaProductoService} from "../../services/categoria-producto.service";
import {ModalAgregarCategoriaComponent} from "../modal-agregar-categoria/modal-agregar-categoria.component";
import Swal from "sweetalert2";
import {AlertasService} from "../sharedMethods/alertas/alertas.service";

@Component({
  selector: 'app-modal-editar-producto',
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['../modal-nuevo-producto/modal-nuevo-producto.component.css'] // './modal-editar-producto.component.css',
})
export class ModalEditarProductoComponent implements OnInit{
  form: FormGroup;
  isSubmitDisabled: boolean = true;
  producto: Producto;
  insumosSeleccionados: any[] = [];
  insumosPorProducto: InsumoProducto[] = [];
  categoriasProducto : CategoriaProducto[] = [];
  //flag para saber cuando se muestra el boton de
  //guardar insumo por producto
  isEditable: boolean = false;
  cantidadEditada : number = 0;
  insumoPorProductoEditandoIndex : number | null = null;
  //imagen del producto
  fileName = '';
  fileError = '';
  selectedImage = '';
  //mostrar incono indicativo
  showScrollIcon : boolean = true;
  //listener para el selector
  menuDesplegado = false;
  // Variable para almacenar la descripción
  descripcionValue: string = '';

  ngOnInit(): void {

    this.categoriaService.refreshNeeded
      .subscribe(
        ()=> {
          this.getCategorias()
        }
      )

    this.ippService.refreshNeeded
      .subscribe(
        () =>{
          this.getInsumosPorProducto(this.producto.id);
        }
      );
    this.getInsumosPorProducto(this.producto.id);
    this.getCategoriasProducto();

    this.mostrarIconoScroll()
  }

  constructor(
    public dialogRef: MatDialogRef<ModalEditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private sanitizer : DomSanitizer,
    private ippService : InsumosPorProductoService,
    public dialog : MatDialog,
    private categoriaService : CategoriaProductoService,
    private alertaService : AlertasService,
  ) {
    this.producto = data.producto || {};

    if(this.producto){
      this.formatearImagen(this.producto);
      this.selectedImage = this.producto.imagenUrl;
      this.descripcionValue = this.producto.descripcion;
    }
    this.form = this.fb.group({
      nombre: [this.producto.nombre, [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      precio: [this.producto.precio, [Validators.required,  Validators.pattern(/^[1-9]\d{0,12}$/)]],
      imagen: [this.producto.imagen],
      descripcion: [this.producto.descripcion, [Validators.required, Validators.maxLength(150)]],
      categoria: [this.producto.categoriaProducto?.id, Validators.required],
      imagenUrl: [this.producto.imagenUrl],
      nuevaImagen : [null]
    });

    this.form.statusChanges.subscribe(
      (status) => {
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
      this.dialogRef.close();
    }
  }
  onImageError() {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    this.selectedImage = 'assets/img/placeholder-hamburguesa.png';
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


  //cargar insumos del producto
  private getInsumosPorProducto(id : number){
    this.ippService.getInsumosPorProducto(id)
      .subscribe(
        data => {
          this.insumosPorProducto = data.object
        },
        error => {
          console.log(error)
        }
      )
  }
  // cargar todas las categorias producto
  private getCategoriasProducto(){
    this.categoriaService.getCategoriasProductos()
      .subscribe(
        data => {
          this.categoriasProducto = data.object
        },
        error => {
          console.log(error)
        }
      )
  }
  //formatear la imagen
  private formatearImagen(productos : any){
    this.producto.imagenUrl = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.producto.imagen);
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
        this.form.get('imagen')?.setValue(file);
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

  onGuardarClick(): void {
    //construir objeto para devolver

    const categoriaProducto : CategoriaProducto = {
      id: this.form.value.categoria,
      nombre: ""
    }

    const producto : Producto = {
      id: this.producto.id,
      nombre: this.form.value.nombre,
      precio: this.form.value.precio,
      imagen: this.form.value.imagen,
      imagenUrl: null,
      descripcion: this.form.value.descripcion,
      categoriaProducto: categoriaProducto
    }

    this.alertaService.alertaPedirConfirmacionEditar()
      .then(
        (resultAlerta) => {
          if(resultAlerta.isConfirmed){

            this.dialogRef.close(producto);
          }else if(resultAlerta.dismiss === Swal.DismissReason.cancel ){
            this.alertaService.alertaSinModificaciones();
          }
        }
      )
  }
  //seleccionar categoria cuando se selecciona
  onCategoriaSeleccionada(event: any): void {
    const categoriaSelect = event.value;
    this.menuDesplegado = false;
  }
  onMenuDesplegado(event: any): void {
    this.menuDesplegado = event;
  }

  quitarCategoria(categoria: any): void {
    this.alertaService.alertaConfirmarEliminar()
      .then(
        (result) => {
          if(result.isConfirmed){
            //proceder a eliminar la categoria
            this.categoriaService.deleteCategoria(categoria.id)
              .subscribe(
                result => {
                  //refrescar las categorias
                  this.getCategorias();
                },
                error => {
                  console.log(error);
                }
              )

            this.alertaService.alertaEliminadoCorrectamente();

          }else if(result.dismiss === Swal.DismissReason.cancel ){
            this.alertaService.alertaSinModificaciones();
          }
        }
      );
  }

  iniciarEdicion(index : number){
    this.isEditable = true;
    this.cantidadEditada = this.insumosPorProducto[index].cantidad;
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
  guardarIpp(ipp : any, index: number){
    ipp.cantidad = this.cantidadEditada;
    this.ippService.updateIpp(ipp)
      .subscribe(
        res =>{

        },
        error => {
          console.log(error)
        }
      );

    this.terminarEdicion(index);
  }
  //eliminar ipp
  eliminarIpp(ippId : number, index : number){
    this.ippService.deleteIpp(ippId)
      .subscribe();
  }

  private getCategorias() {
    this.categoriaService.getCategoriasProductos()
      .subscribe(
        data => {
          this.categoriasProducto = data.object
        },
        error => {
          console.log(error);
        }
      )
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

  //modal agregar insumo
  modalAgregarInsumo() : void{
    const dialogRef = this.dialog.open(ModalIppComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '400px',
      data: {id : this.producto.id},
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if(result){
          const ipp : InsumoProducto = result;
          this.ippService.createIpp(ipp)
            .subscribe();
        }
        this.getInsumosPorProducto(this.producto.id)
        this.mostrarIconoScroll();
      }
    )
  }

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
}
