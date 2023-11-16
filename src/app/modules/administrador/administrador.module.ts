import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorComponent } from './administrador.component';
import {AdministradorRoutingModule} from "./administrador-routing.module";
import { InsumosComponent } from './components';
import { MenuComponent } from './utils/menu/menu.component';
import { FooterComponent } from './utils/footer/footer.component';
import {MatTableModule} from '@angular/material/table';
import { NuevoInsumoComponent } from './components/nuevo-insumo/nuevo-insumo.component';
import {FormsModule} from "@angular/forms";
import { ProductosComponent } from './components/productos/productos.component';
import {FileUploadModule} from "primeng/fileupload";
import {SafePipe} from "./pipes";
import { CategoriaProductoComponent } from './components/categoria-producto/categoria-producto.component';


@NgModule({
  declarations: [
    AdministradorComponent,
    InsumosComponent,
    NuevoInsumoComponent,
    ProductosComponent,
    SafePipe,
    CategoriaProductoComponent
  ],
    imports: [
        CommonModule,
        AdministradorRoutingModule,
        MenuComponent,
        FooterComponent,
        MatTableModule,
        FormsModule,
        FileUploadModule,
    ]
})
export class AdministradorModule { }
