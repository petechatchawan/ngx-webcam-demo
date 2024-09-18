// src/app/camera-init.factory.ts

import { CameraUtilsService } from 'ngx-webcam-management';

/**
 * Factory function to initialize camera devices.
 * This function will be called before the application starts.
 *
 * @param cameraController - An instance of the CameraController
 * @returns A function that returns a Promise for initialization.
 */
export function initializeCamera(cameraController: CameraUtilsService) {
  return (): Promise<void> => {
    return cameraController.initializeCameraDevices();
  };
}
