import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CategoriaProducto, insumo, InsumoProducto} from "../../interfaces";
import {DomSanitizer} from "@angular/platform-browser";
import {Producto} from "../../interfaces/producto";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {ModalIppComponent} from "../modal-ipp/modal-ipp.component";
import {CategoriaProductoService} from "../../services/categoria-producto.service";

@Component({
  selector: 'app-modal-editar-producto',
  templateUrl: './modal-editar-producto.component.html',
  styleUrls: ['./modal-editar-producto.component.css']
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


  ngOnInit(): void {
    this.ippService.refreshNeeded
      .subscribe(
        () =>{
          this.getInsumosPorProducto(this.producto.id);
        }
      );
    this.getInsumosPorProducto(this.producto.id);
    this.getCategoriasProducto();

  }

  constructor(
    public dialogRef: MatDialogRef<ModalEditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private sanitizer : DomSanitizer,
    private ippService : InsumosPorProductoService,
    public dialog : MatDialog,
    private categoriaService : CategoriaProductoService
  ) {
    this.producto = data.producto || {};

    if(this.producto){
      this.formatearImagen(this.producto);
    }
    this.form = this.fb.group({
      nombre: [this.producto.nombre, [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      precio: [this.producto.precio, [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      imagen: [this.producto.imagen],
      descripcion: [this.producto.descripcion],
      categoria: [this.producto.categoriaProducto?.id, Validators.required]
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

  toggleInsumoSeleccionado(insumo: any) {
    const control = this.form.get(insumo.id.toString());
    if (control) {
      if (control.value) {
        // Si el insumo está seleccionado, añadirlo al array de insumos seleccionados
        this.insumosSeleccionados.push(insumo);
      } else {
        // Si el insumo se deselecciona, quitarlo del array de insumos seleccionados
        const index = this.insumosSeleccionados.findIndex((i) => i.id === insumo.id);
        if (index !== -1) {
          this.insumosSeleccionados.splice(index, 1);
        }
      }
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
    const file = event.target.files[0];
    if (file) {
      // Asigna el archivo al control 'nuevaImagen'
      this.form.get('nuevaImagen')?.setValue(file);

      // Lee y muestra la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.form.get('imagen')?.setValue(e.target.result);
      };
      reader.readAsDataURL(file);
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
      imagenUrl: this.producto.imagenUrl,
      descripcion: this.form.value.descripcion,
      categoriaProducto: categoriaProducto
    }

    this.dialogRef.close(producto);
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
    console.log(ipp);
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

  //modal agregar insumo
  modalAgregarInsumo() : void{
    const dialogRef = this.dialog.open(ModalIppComponent, {
      width: '400px', // Ajusta el ancho según tus necesidades
      position: { right: '0' }, // Posiciona el modal a la derecha
      height: '600px',
      data: {id : this.producto.id},
    });

    dialogRef.afterClosed().subscribe(
      (result) => {
        if(result){
          console.log('datos del modal: ', result)
        }
        this.getInsumosPorProducto(this.producto.id)
      }
    )
  }
}
