import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HomePage } from './home/home.page';
import { DeviceUtils, CameraUtilsService } from 'ngx-webcam-management';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  message =
    'This modal example uses the modalController to present and dismiss modals.';
  deviceInfo: any;

  constructor(
    private cameraUtilsService: CameraUtilsService,
    private deviceUtils: DeviceUtils,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit(): Promise<void> {
    this.deviceInfo = this.deviceUtils.getDeviceInfo();
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: HomePage,
      cssClass: 'my-modal-fullscreen',
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log(data, role);

    if (role === 'confirm') {
      this.message = `Hello, ${data}!`;
    } else {
      this.message = `Hello, ${data.errorMessage}!`;
    }
  }
}
