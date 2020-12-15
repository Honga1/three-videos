/* eslint-disable no-undef */
export const workerCode = () => {
  // eslint-disable-next-line no-restricted-globals
  self.importScripts(
    'https://unpkg.com/@tensorflow/tfjs-core@2.7.0/dist/tf-core.js',
    'https://unpkg.com/@tensorflow/tfjs-converter@2.7.0/dist/tf-converter.js',
    'https://unpkg.com/@tensorflow/tfjs-backend-webgl@2.7.0/dist/tf-backend-webgl.js',
    'https://unpkg.com/@tensorflow/tfjs-backend-cpu@2.7.0/dist/tf-backend-cpu.js',
    'https://unpkg.com/@tensorflow-models/face-landmarks-detection@0.0.2/dist/face-landmarks-detection.js',
  );

  // eslint-disable-next-line no-restricted-globals
  self.model = undefined;
  // eslint-disable-next-line no-restricted-globals
  self.modelPromise = undefined;
  var canvas = new OffscreenCanvas(640, 480);
  var context = canvas.getContext('2d');
  // eslint-disable-next-line no-restricted-globals
  self.addEventListener('message', async (e) => {
    if (!e) return;
    if (!context) return;

    context.drawImage(e.data, 0, 0);
    e.data.close();

    // eslint-disable-next-line no-restricted-globals
    self.model = await loadModelIfNeeded(self.model);
    const predictions = await model.estimateFaces({
      input: canvas,
      returnTensors: false,
      predictIrises: false,
    });

    postMessage(predictions);
  });

  async function loadModelIfNeeded(model) {
    if (modelPromise === undefined) {
      await tf.setBackend('webgl');
      console.log('loading model');
      const result = faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1, shouldLoadIrisModel: false },
      );
      modelPromise = result;
    }
    return await modelPromise;
  }
};
