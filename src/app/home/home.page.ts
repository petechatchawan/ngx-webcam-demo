import {
  Component,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  CameraDevice,
  CameraUtilsService,
  FacingType,
  ResolutionPreset,
  WebcamInitData,
  WebcamInitError,
} from 'ngx-webcam-management';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    await this.initializeCamera();
  }

  private async initializeCamera(): Promise<void> {
    try {
      const selectedCamera = await this.selectCamera();
      if (!selectedCamera) throw new Error('No camera selected');

      const config: WebcamInitData = {
        device: selectedCamera,
        element: {
          video: this.videoElement.nativeElement,
          canvas: this.canvasElement.nativeElement,
        },
        config: {
          enabledAudio: false,
          present: ResolutionPreset.VeryHigh,
          strictAspectRatio: true,
        },
      };

      const allResolutions = this.cameraUtilsService.getAllResolutionsPresets();
      if (!(config.config.present in allResolutions)) {
        throw new WebcamInitError(
          'Provided resolution preset does not match any available resolutions'
        );
      }

      await this.cameraUtilsService.startCamera(config);

      const mediaStream = this.cameraUtilsService.getMediaStream();
      if (!mediaStream) throw new Error('Failed to get media stream');

      this.videoElement.nativeElement.srcObject = mediaStream;
      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoElement.nativeElement.play();
      };
    } catch (error: any) {
      this.handleError(error);
    }
  }

  private async selectCamera(): Promise<CameraDevice | null> {
    const cameraDevices = this.cameraUtilsService.getAvailableDevices();
    if (cameraDevices.length === 0) {
      throw new Error('No camera devices found');
    }

    const camera = this.cameraUtilsService.selectCamera(FacingType.FRONT);
    if (!camera) {
      throw new Error('No camera found');
    }

    return camera;
  }

  async takePicture(): Promise<void> {
    try {
      this.imageDataUrl = await this.cameraUtilsService.takePicture();
      console.log('Captured Image Data URL:', this.imageDataUrl);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  }

  private handleError(error: any): void {
    console.error('Error setting up camera:', error);
    this.modalController
      .dismiss({ errorMessage: error.message }, 'cancel')
      .catch((dismissError) =>
        console.error('Error dismissing modal:', dismissError)
      );

    if (error instanceof WebcamInitError) {
      console.warn('Webcam initialization error:', error.message);
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
