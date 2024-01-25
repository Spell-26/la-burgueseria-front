import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministradorComponent} from "./administrador.component";
import {
  CuentasComponent,
  EmpleadosComponent, IngresosComponent,
  InsumosComponent,
  MesasComponent,
  ProductosComponent
} from "./components";
import {EgresosComponent} from "./components/egresos/egresos.component";

const routes: Routes = [
  {
    path : '',
    component: AdministradorComponent,
    children: [
      {path: 'insumos', component: InsumosComponent},
      {path: 'productos', component: ProductosComponent},
      {path: 'mesas', component: MesasComponent},
      {path: 'empleados', component: EmpleadosComponent},
      {path: 'cuentas', component: CuentasComponent},
      {path: 'ingresos', component: IngresosComponent},
      {path: 'egresos', component: EgresosComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
