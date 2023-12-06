import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministradorComponent} from "./administrador.component";
import {
  CategoriaProductoComponent, CuentasComponent,
  EmpleadosComponent, IngresosComponent,
  InsumosComponent,
  MesasComponent,
  ProductosComponent
} from "./components";

const routes: Routes = [
  {
    path : '',
    component: AdministradorComponent,
    children: [
      {path: 'insumos', component: InsumosComponent},
      {path: 'productos', component: ProductosComponent},
      {path: 'productos/categoria', component: CategoriaProductoComponent},
      {path: 'mesas', component: MesasComponent},
      {path: 'empleados', component: EmpleadosComponent},
      {path: 'cuentas', component: CuentasComponent},
      {path: 'ingresos', component: IngresosComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
