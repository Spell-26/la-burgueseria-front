import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatDialogRef } from "@angular/material/dialog";
import { InsumosService } from "../../services/insumos.service";
import { map, Observable, startWith } from "rxjs";

@Component({
  selector: 'app-modal-agregar-insumo',
  templateUrl: './modal-agregar-insumo.component.html',
  styleUrls: ['./modal-agregar-insumo.component.css']
})
export class ModalAgregarInsumoComponent implements OnInit {
  form: FormGroup;
  insumos: string[] = [];
  filteredOptions: Observable<string[]> | undefined;
  nombreControl = new FormControl();
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
    private insumoService: InsumosService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      cantidad: [null, [Validators.required, Validators.pattern(/^[1-9]\d{0,12}$/)]],
    });
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
          startWith(''),
          map((value: string) => this._filter(value))
        );

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onImageError() {
    // Puedes realizar otras acciones aquí, como establecer una imagen de reemplazo.
    this.selectedImage = 'assets/img/placeholder-hamburguesa.png';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.insumos.filter(option => option.toLowerCase().includes(filterValue));
  }

  //PETICIONES HTTP
  private getInsumos() {
    this.insumoService.getInsumos()
      .subscribe(
        (result) => {
          const insumosObj = result.object;
          this.insumos = [];
          insumosObj.forEach(insumo => {
            this.insumos.push(insumo.nombre)
          })
        }
      );
  }
}
