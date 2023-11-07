import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradorComponent } from './administrador.component';
import {AdministradorRoutingModule} from "./administrador-routing.module";
import { InsumosComponent } from './components';
import { MenuComponent } from './utils/menu/menu.component';
import { FooterComponent } from './utils/footer/footer.component';
import {MatTableModule} from '@angular/material/table';
import { NuevoInsumoComponent } from './components/nuevo-insumo/nuevo-insumo.component';


@NgModule({
  declarations: [
    AdministradorComponent,
    InsumosComponent,
    NuevoInsumoComponent,

  ],
  imports: [
    CommonModule,
    AdministradorRoutingModule,
    MenuComponent,
    FooterComponent,
    MatTableModule,
  ]
})
export class AdministradorModule { }
