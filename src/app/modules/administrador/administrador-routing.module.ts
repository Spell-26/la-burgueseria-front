import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministradorComponent} from "./administrador.component";
import {CategoriaProductoComponent, InsumosComponent, MesasComponent, ProductosComponent} from "./components";

const routes: Routes = [
  {
    path : '',
    component: AdministradorComponent,
    children: [
      {path: 'insumos', component: InsumosComponent},
      {path: 'productos', component: ProductosComponent},
      {path: 'productos/categoria', component: CategoriaProductoComponent},
      {path: 'mesas', component: MesasComponent}
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
