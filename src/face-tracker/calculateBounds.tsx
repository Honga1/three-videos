import { Coords3D } from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util';

export const calculateBounds = (
  meshCoordinates: Coords3D,
): {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  zMin: number;
  zMax: number;
} => {
  const bounds = {
    xMin: Infinity,
    xMax: -Infinity,

    yMin: Infinity,
    yMax: -Infinity,

    zMin: Infinity,
    zMax: -Infinity,
  };

  for (let index = 0; index < meshCoordinates.length; index++) {
    const coord = meshCoordinates[index];
    if (!coord) continue;

    const [x, y, z] = coord;

    const xScaled = x;
    const yScaled = y;
    const zScaled = z;

    bounds.xMax = Math.max(bounds.xMax, xScaled);
    bounds.xMin = Math.min(bounds.xMin, xScaled);

    bounds.yMax = Math.max(bounds.yMax, yScaled);
    bounds.yMin = Math.min(bounds.yMin, yScaled);

    bounds.zMax = Math.max(bounds.zMax, zScaled);
    bounds.zMin = Math.min(bounds.zMin, zScaled);
  }

  return bounds;
};
