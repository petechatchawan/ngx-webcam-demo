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
      // Get available cameras
      const cameraDevices = this.cameraUtilsService.getAvailableDevices();
      if (cameraDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Select the camera device
      const selectedCamera = await this.selectCamera();
      if (!selectedCamera) {
        throw new Error('No camera selected');
      }

      // Create config
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

      // Ensure the resolution preset exists
      const allResolutions = this.cameraUtilsService.getAllResolutionsPresets();
      if (!(config.config.present in allResolutions)) {
        throw new WebcamInitError(
          'Provided resolution preset does not match any available resolutions'
        );
      }

      // Start the camera
      await this.cameraUtilsService.startCamera(config);

      // Set current media stream to video element source
      const mediaStream = this.cameraUtilsService.getMediaStream();
      if (!mediaStream) {
        throw new Error('Failed to get media stream');
      }

      this.videoElement.nativeElement.srcObject = mediaStream;
      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoElement.nativeElement.play();
      };
    } catch (error: any) {
      console.error('Error setting up camera:', error);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Close modal and pass the error message back
      await this.modalController.dismiss(
        { errorMessage: error.message },
        'cancel'
      );

      if (error instanceof WebcamInitError) {
        // Handle specific webcam initialization errors here if needed
        console.warn('Webcam initialization error:', error.message);
      }
    }
  }

  private async selectCamera(): Promise<CameraDevice | null> {
    // Implement logic to select the best camera
    const caemra = this.cameraUtilsService.selectCamera(FacingType.FRONT);
    if (!caemra) {
      throw new Error('No camera found');
    }

    return caemra;
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
