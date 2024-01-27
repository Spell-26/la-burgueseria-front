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
import {PanelDeGestionComponent} from "./components/panel-de-gestion/panel-de-gestion.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard', // Redirige a la ruta 'insumos' por defecto
    pathMatch: 'full', // Asegura que solo redireccione cuando la ruta está vacía
  },
  {
    path : '',
    component: AdministradorComponent,
    children: [
      {path: 'dashboard', component: PanelDeGestionComponent},
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
