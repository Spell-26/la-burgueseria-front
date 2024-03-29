import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./home.component";
import {LoginComponent} from "./components/login/login.component";
import {ResetPassComponent} from "./components/reset-pass/reset-pass.component";

const routes: Routes = [
  { path : '', component: HomeComponent},
  {path : 'login', component: LoginComponent},
  {path: 'login/recover', component: ResetPassComponent},
  { path: 'login/recover/:correoUsuario', component: ResetPassComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
