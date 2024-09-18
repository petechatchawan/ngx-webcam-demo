import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CameraDevice, CameraUtilsService } from 'ngx-webcam-management';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  public name: string | null = null;
  public imageDataUrl: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private modalController: ModalController,
    private cameraUtilsService: CameraUtilsService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.setupCamera();
  }

  public async setupCamera(): Promise<void> {
    try {
      // setup video and canvas
      const videoEl = this.videoElement.nativeElement;
      const canvasEl = this.canvasElement.nativeElement;

      // get available cameras
      const devices = this.cameraUtilsService.getAvailableDevices();
      if (devices.length === 0) {
        throw new Error('No camera devices found');
      }

      // select the camera device
      const selectedCamera = await this.selectCamera(devices);

      // start the camera
      await this.cameraUtilsService.startCamera(
        videoEl,
        canvasEl,
        selectedCamera
      );

      // set current media stream to video element
      const mediaStream = this.cameraUtilsService.getMediaStream();
      if (!mediaStream) {
        throw new Error('Failed to get media stream');
      }

      videoEl.srcObject = mediaStream;
      videoEl.onloadedmetadata = () => {
        videoEl.play();
      };
    } catch (error) {
      console.error('Error setting up camera:', error);
    }
  }

  private async selectCamera(devices: CameraDevice[]): Promise<CameraDevice> {
    // Implement logic to select the best camera
    return devices[0];
  }

  /**
   * Captures an image from the current video stream.
   *
   * @returns A promise that resolves when the image has been captured.
   * The promise resolves to `undefined`.
   */
  async captureImage(): Promise<void> {
    try {
      this.imageDataUrl = await this.cameraUtilsService.takePicture();
      console.log('Captured Image Data URL:', this.imageDataUrl);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cameraUtilsService.stopCamera();
  }

  public cancel(): Promise<boolean> {
    return this.modalController.dismiss(null, 'cancel');
  }

  public confirm(): Promise<boolean> {
    return this.modalController.dismiss(this.name, 'confirm');
  }
}
