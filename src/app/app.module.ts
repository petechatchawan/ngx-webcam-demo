import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {
  CameraUtilsService,
  NgxWebcamManagementModule,
} from 'ngx-webcam-management';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeCamera } from './camera-init.factory';
import { HomePage } from './home/home.page';

@NgModule({
  declarations: [AppComponent, HomePage],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    NgxWebcamManagementModule,
  ],
  providers: [
    CameraUtilsService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeCamera,
      deps: [CameraUtilsService], // Inject CameraController into the factory
      multi: true, // Allow multiple initializers
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
