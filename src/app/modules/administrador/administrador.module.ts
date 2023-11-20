import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorComponent } from './administrador.component';
import {AdministradorRoutingModule} from "./administrador-routing.module";
import { InsumosComponent } from './components';
import { MenuComponent } from './utils/menu/menu.component';
import { FooterComponent } from './utils/footer/footer.component';
import {MatTableModule} from '@angular/material/table';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { ProductosComponent } from './components/productos/productos.component';
import {FileUploadModule} from "primeng/fileupload";
import {SafePipe} from "./pipes";
import { CategoriaProductoComponent } from './components/categoria-producto/categoria-producto.component';
import { ModalInsumosComponent } from './utils/modal-insumos/modal-insumos.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";


@NgModule({
  declarations: [
    AdministradorComponent,
    InsumosComponent,
    ProductosComponent,
    SafePipe,
    CategoriaProductoComponent,
    ModalInsumosComponent
  ],
  imports: [
    CommonModule,
    AdministradorRoutingModule,
    MenuComponent,
    FooterComponent,
    MatTableModule,
    FormsModule,
    FileUploadModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
  ]
})
export class AdministradorModule { }
