import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdministradorComponent} from "./administrador.component";
import {InsumosComponent} from "./components";

const routes: Routes = [
  { path : '', component: AdministradorComponent},
  {path: 'insumos', component: InsumosComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministradorRoutingModule { }
