import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Producto} from "../../interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProductosService} from "../../services/productos.service";

@Component({
  selector: 'app-modal-add-producto',
  templateUrl: './modal-add-producto.component.html',
  styleUrls: ['./modal-add-producto.component.css']
})
export class ModalAddProductoComponent implements OnInit{

  form : FormGroup;
  productos : Producto [] = [];
  ngOnInit(): void {
    this.getProductos();
  }

  constructor(
    public dialogRef : MatDialogRef<ModalAddProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb : FormBuilder,
    private productoService : ProductosService,
  ) {
    this.form = this.fb.group(
      {
        producto : [null, Validators.required],
        cantidad: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
      }
    )
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(){
    if(this.form.valid){
      this.dialogRef.close(this.form.value)
    }
  }

  /*
  * PETICIONES
  * */
  private getProductos(){
    this.productoService.getProductos()
      .subscribe(
        data =>{
          this.productos = data.object;
        }
      )
  }
}
