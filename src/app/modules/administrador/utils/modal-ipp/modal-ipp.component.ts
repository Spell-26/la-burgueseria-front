import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {InsumosService} from "../../services/insumos.service";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {insumo, InsumoProducto, Producto} from "../../interfaces";

@Component({
  selector: 'app-modal-ipp',
  templateUrl: './modal-ipp.component.html',
  styleUrls: ['./modal-ipp.component.css']
})
export class ModalIppComponent implements OnInit{
  form: FormGroup ;
  insumos : insumo[] = [];
  productoId : number = 0;
  ngOnInit(): void {
    this.getInsumos();
  }

  constructor(
    public dialogRef: MatDialogRef<ModalIppComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private insumoService : InsumosService,
    private ippService : InsumosPorProductoService
  ) {

  if(data){
    this.productoId = data.id;
  }


    this.form = this.fb.group({
      insumoSeleccionado: [null, Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0)]],
    });


  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const insumoSeleccionado = this.form.value.insumoSeleccionado;
      const cantidad = this.form.value.cantidad;

      //crear instancias para crear el ipp
      const producto : Producto ={
        id: this.productoId,
        nombre: "",
        precio: 0,
        imagen: null,
        imagenUrl: null,
        descripcion: "",
        categoriaProducto: null
      }
      const insumo : insumo = {
        id: insumoSeleccionado.id,
        nombre: insumoSeleccionado.nombre,
        cantidad : 0
      }

      const insumosProducto : InsumoProducto = {
        id: 0,
        cantidad: cantidad,
        producto: producto,
        insumo: insumo
      }

      this.dialogRef.close(insumosProducto);
    }
  }


  //PETICIONES HTTP
  private getInsumos(){
    this.insumoService.getInsumos()
      .subscribe(
        data =>{
          this.insumos = data.object
        },
        error => {
          console.log(error);
        }
      )
  }
}
