import { CameraUtilsService } from 'ngx-webcam-management';

export function initializeCamera(cameraUtilsService: CameraUtilsService) {
  return (): Promise<void> => {
    // Add custom resolution presets
    cameraUtilsService.addCustomResolutionPreset('square-fhd', 1080, 1080);
    cameraUtilsService.addCustomResolutionPreset('square-hd', 720, 720);

    cameraUtilsService.initializeCameraDevices().catch((error) => {
      console.error('Error initializing camera devices:', error);
    });

    return Promise.resolve();
  };
}
