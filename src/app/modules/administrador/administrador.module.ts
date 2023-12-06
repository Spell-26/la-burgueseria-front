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
import { CategoriaProductoComponent } from './components/categoria-producto/categoria-producto.component';
import { ModalInsumosComponent } from './utils/modal-insumos/modal-insumos.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import { ModalLateralComponent } from './utils/modal-lateral/modal-lateral.component';
import {MatSelectModule} from "@angular/material/select";
import { ModalEditarProductoComponent } from './utils/modal-editar-producto/modal-editar-producto.component';
import {MatCheckboxModule} from "@angular/material/checkbox";
import { ModalIppComponent } from './utils/modal-ipp/modal-ipp.component';
import { MesasComponent } from './components/mesas/mesas.component';
import { EmpleadosComponent } from './components/empleados/empleados.component';
import { IngresosComponent } from './components/ingresos/ingresos.component';
import { CuentasComponent } from './components/cuentas/cuentas.component';


@NgModule({
  declarations: [
    AdministradorComponent,
    InsumosComponent,
    ProductosComponent,
    CategoriaProductoComponent,
    ModalInsumosComponent,
    ModalLateralComponent,
    ModalEditarProductoComponent,
    ModalIppComponent,
    MesasComponent,
    EmpleadosComponent,
    IngresosComponent,
    CuentasComponent
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
        MatSelectModule,
        MatCheckboxModule,
    ]
})
export class AdministradorModule { }
