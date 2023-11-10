import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministradorComponent} from "./administrador.component";
import {InsumosComponent, NuevoInsumoComponent} from "./components";

const routes: Routes = [
  {
    path : '',
    component: AdministradorComponent,
    children: [
      {path: 'insumos', component: InsumosComponent},
      {path:'insumos/nuevo', component: NuevoInsumoComponent},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
