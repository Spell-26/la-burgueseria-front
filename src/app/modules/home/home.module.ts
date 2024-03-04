import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import {HomeRoutingModule} from "./home-routing.module";
import { LoginComponent } from './components/login/login.component';
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {FooterComponent} from "../administrador/utils/footer/footer.component";



@NgModule({
  declarations: [
    HomeComponent,
    LoginComponent
  ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        MatButtonModule,
        FooterComponent
    ]
})
export class HomeModule { }
