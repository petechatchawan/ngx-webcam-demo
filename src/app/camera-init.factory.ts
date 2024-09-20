import { CameraUtilsService } from 'ngx-webcam-management';

/**
 * Factory function to initialize camera devices.
 * This function will be called before the application starts.
 *
 * @param cameraUtilsService - An instance of the CameraUtilsService
 * @returns A function that returns a Promise for initialization.
 */
export function initializeCamera(cameraUtilsService: CameraUtilsService) {
  return (): Promise<void> => {
    // Add custom resolution presets
    cameraUtilsService.addCustomResolutionPreset('square-fhd', 1080, 1080);
    cameraUtilsService.addCustomResolutionPreset('square-hd', 720, 720);

    // Initialize camera devices in the background without waiting
    cameraUtilsService.initializeCameraDevices().catch(error => {
      console.error('Error initializing camera devices:', error);
      // Handle any errors that occur during initialization
    });

    // Return a resolved promise immediately
    return Promise.resolve();
  };
}