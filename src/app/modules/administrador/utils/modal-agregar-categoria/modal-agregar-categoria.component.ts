import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CategoriaProducto, insumo, InsumoProducto, Producto} from "../../interfaces";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {InsumosService} from "../../services/insumos.service";
import {InsumosPorProductoService} from "../../services/insumos-por-producto.service";
import {CategoriaProductoService} from "../../services/categoria-producto.service";

@Component({
  selector: 'app-modal-agregar-categoria',
  templateUrl: './modal-agregar-categoria.component.html',
  styleUrls: ['./modal-agregar-categoria.component.css']
})
export class ModalAgregarCategoriaComponent {
  form: FormGroup ;

  ngOnInit(): void {

  }

  constructor(
    public dialogRef: MatDialogRef<ModalAgregarCategoriaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private cetegoriaService : CategoriaProductoService
  ) {


    this.form = this.fb.group({
      categoria: [null, Validators.required, ],
    });


  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      //crear instancia de la categoria
      const categoria : CategoriaProducto = {
        id: 0,
        nombre: this.form.value.categoria
      }

      //peticion http para crear la categoria
      this.cetegoriaService.crearCategoria(categoria)
        .subscribe();


      this.dialogRef.close();
    }
  }

}
