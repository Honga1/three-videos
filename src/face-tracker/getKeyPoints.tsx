import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import {
  AnnotatedPrediction,
  MediaPipeFaceMesh,
} from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh';
import {
  Coord2D,
  Coords3D,
} from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util';

let model: MediaPipeFaceMesh | undefined = undefined;

export async function getKeyPoints(
  input: HTMLVideoElement | HTMLImageElement,
): Promise<IKeyPoints | undefined> {
  model = await loadModelIfNeeded(model);

  const predictions = await model.estimateFaces({
    input,
    returnTensors: false,
    predictIrises: false,
  });

  const firstFacePrediction = predictions[0] as
    | (AnnotatedPrediction & {
        kind: 'MediaPipePredictionValues';
      })
    | undefined;

  if (firstFacePrediction === undefined) return undefined;

  const inputDimensions = getInputDimensions(input);

  const { scaledMesh } = firstFacePrediction;

  const normalizedMesh: Coords3D = getNormalizedMesh(scaledMesh, inputDimensions);

  const normalizedBoundingBox = getNormalizedBoundingBox(
    firstFacePrediction.boundingBox,
    inputDimensions,
  );

  const keyPoints: IKeyPoints = {
    ...firstFacePrediction,
    source: input,
    normalizedMesh,
    aspect: inputDimensions.aspect,
    normalizedBoundingBox,
  };

  return keyPoints;
}
export async function getKey(
  input: HTMLVideoElement,
  predictions: AnnotatedPrediction[],
): Promise<IKeyPoints | undefined> {
  model = await loadModelIfNeeded(model);

  const firstFacePrediction = predictions[0] as
    | (AnnotatedPrediction & {
        kind: 'MediaPipePredictionValues';
      })
    | undefined;

  if (firstFacePrediction === undefined) return undefined;

  const inputDimensions = { width: 640, height: 480, aspect: 640 / 480 };

  const { scaledMesh } = firstFacePrediction;

  const normalizedMesh: Coords3D = getNormalizedMesh(scaledMesh, inputDimensions);

  const normalizedBoundingBox = getNormalizedBoundingBox(
    firstFacePrediction.boundingBox,
    inputDimensions,
  );

  const keyPoints: IKeyPoints = {
    ...firstFacePrediction,
    source: input,
    normalizedMesh,
    aspect: inputDimensions.aspect,
    normalizedBoundingBox,
  };

  return keyPoints;
}

export interface BoundingBox {
  topLeft: Coord2D;
  bottomRight: Coord2D;
}

export interface IKeyPoints {
  source: HTMLImageElement | HTMLVideoElement;
  faceInViewConfidence: number;
  boundingBox: BoundingBox;
  normalizedBoundingBox: BoundingBox;
  mesh: Coords3D;
  /** Facial landmark coordinates normalized to input dimensions. */
  scaledMesh: Coords3D;
  /** Facial landmark coordinates normalized to 0-1 */
  normalizedMesh: Coords3D;
  aspect: number;
}

let pendingPromise: Promise<MediaPipeFaceMesh> | undefined;
async function loadModelIfNeeded(model: MediaPipeFaceMesh | undefined) {
  if (pendingPromise === undefined) {
    const result = faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1, shouldLoadIrisModel: false },
    );
    pendingPromise = result;
  }
  return await pendingPromise;
}

function getNormalizedMesh(
  scaledMesh: Coords3D,
  inputDimensions: { width: number; height: number },
): Coords3D {
  const normalizedMesh: Coords3D = [];

  for (let index = 0; index < scaledMesh.length; index++) {
    const [x, y, z] = scaledMesh[index]!;
    normalizedMesh.push([
      x / inputDimensions.width,
      -y / inputDimensions.height,
      z / inputDimensions.width,
    ]);
  }

  return normalizedMesh;
}

function getNormalizedBoundingBox(
  boundingBox: BoundingBox,
  inputDimensions: { width: number; height: number },
): BoundingBox {
  return {
    topLeft: [
      boundingBox.topLeft[0] / inputDimensions.width,
      boundingBox.topLeft[1] / inputDimensions.height,
    ],
    bottomRight: [
      boundingBox.bottomRight[0] / inputDimensions.width,
      boundingBox.bottomRight[1] / inputDimensions.height,
    ],
  };
}

function getInputDimensions(input: HTMLVideoElement | HTMLImageElement) {
  if (isInputVideo(input)) {
    return {
      width: input.videoWidth,
      height: input.videoHeight,
      aspect: input.videoWidth / input.videoHeight,
    };
  } else {
    return {
      width: input.width,
      height: input.height,
      aspect: input.width / input.height,
    };
  }
}
function isInputVideo(input: HTMLVideoElement | HTMLImageElement): input is HTMLVideoElement {
  return input instanceof HTMLVideoElement;
}
