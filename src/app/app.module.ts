import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {JwtInterceptorService} from "./modules/home/services/auth/jwt-interceptor.service";
import {ErrorInterceptorService} from "./modules/home/services/auth/error-interceptor.service";
import {FooterComponent} from "./modules/administrador/utils/footer/footer.component";


@NgModule({
  declarations: [
    AppComponent,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        NgbModule,
        FooterComponent,
    ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass : JwtInterceptorService, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptorService, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
