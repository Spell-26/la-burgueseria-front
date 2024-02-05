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
import { ModalCuentasComponent } from './utils/modal-cuentas/modal-cuentas.component';
import { ModalAddProductoComponent } from './utils/modal-add-producto/modal-add-producto.component';
import { ModalEditarCuentaComponent } from './utils/modal-editar-cuenta/modal-editar-cuenta.component';
import { ModalIngresosComponent } from './utils/modal-ingresos/modal-ingresos.component';
import { ModalNuevoProductoComponent } from './utils/modal-nuevo-producto/modal-nuevo-producto.component';
import { ModalAgregarCategoriaComponent } from './utils/modal-agregar-categoria/modal-agregar-categoria.component';
import { BootstrapRangeCalendarComponent } from './utils/widgets/bootstrap-range-calendar/bootstrap-range-calendar.component';
import {MenuResponsiveComponent} from "./utils/menu-responsive/menu-responsive.component";
import { EgresosComponent } from './components/egresos/egresos.component';
import { ModalEgresosComponent } from './utils/modal-egresos/modal-egresos.component';
import { PanelDeGestionComponent } from './components/panel-de-gestion/panel-de-gestion.component';
import { ModalDashboardComponent } from './utils/modal-dashboard/modal-dashboard.component';
import { ZoomeableChartComponent } from './utils/graficos/zoomeable-chart/zoomeable-chart.component';
import {NgApexchartsModule} from "ng-apexcharts";
import { ContrastChartComponent } from './utils/graficos/contrast-chart/contrast-chart.component';
import {MenuCuentasComponent} from "./utils/menu-cuentas/menu-cuentas.component";
import {MatTabsModule} from "@angular/material/tabs";


@NgModule({
  declarations: [
    AdministradorComponent,
    InsumosComponent,
    ProductosComponent,
    ModalInsumosComponent,
    ModalLateralComponent,
    ModalEditarProductoComponent,
    ModalIppComponent,
    MesasComponent,
    EmpleadosComponent,
    IngresosComponent,
    CuentasComponent,
    ModalCuentasComponent,
    ModalAddProductoComponent,
    ModalEditarCuentaComponent,
    ModalIngresosComponent,
    ModalNuevoProductoComponent,
    ModalAgregarCategoriaComponent,
    EgresosComponent,
    ModalEgresosComponent,
    PanelDeGestionComponent,
    ModalDashboardComponent,
    ZoomeableChartComponent,
    ContrastChartComponent,

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
        BootstrapRangeCalendarComponent,
        MenuResponsiveComponent,
        NgApexchartsModule,
        MenuCuentasComponent,
        MatTabsModule
    ]
})
export class AdministradorModule { }
