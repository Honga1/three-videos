import {
  Coord2D,
  Coord3D,
  Coords3D,
} from '@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh/util';
import { SharedCanvasContext, Viewport } from 'react-three-fiber';
import { CanvasTexture, Texture, Vector3 } from 'three';
import createHook from 'zustand';
import createVanilla from 'zustand/vanilla';
import { calculateBounds } from './calculateBounds';
import { BoundingBox, IKeyPoints } from './getKeyPoints';
import { KEY_AREA_GROUPS, PartGroups, PART_GROUPS } from './part-groups';

interface PartLocations {
  LEFT_EYE: Coords3D;
  RIGHT_EYE: Coords3D;
  MOUTH: Coords3D;
  NOSE: Coords3D;
  FACE_PLANE: Coords3D;
  NOSE_TIP: Coords3D;
  SILHOUETTE: Coords3D;
}

interface PartTextures {
  LEFT_EYE: Texture;
  RIGHT_EYE: Texture;
  MOUTH: Texture;
  NOSE: Texture;
  SILHOUETTE: Texture;
}

interface PlaneDescriptor {
  normal: Coord3D;
  offset: number;
  zRotation: number;
}

export interface KeyPoints<T extends HTMLImageElement | HTMLVideoElement> {
  source: T;
  parts: PartLocations;
  mesh: Coords3D;
  scaledMesh: Coords3D;
  normalizedMesh: Coords3D;
  sourceAspect: number;
  facePlane: PlaneDescriptor;
  boundingBox: BoundingBox;
}

export type State = {
  video: KeyPoints<HTMLVideoElement> | undefined;
  image: KeyPoints<HTMLImageElement> | undefined;
  videoPartTextures: PartTextures | undefined;
  canvasContext: SharedCanvasContext | undefined;
  setNormalizedMesh: (keyPoints: IKeyPoints) => void;
  updateMeshes: () => void;
  setCanvasContext: (canvasContext: SharedCanvasContext) => void;
  getVideoPartTextures: () => Promise<PartTextures | undefined>;
};

const getVideoPartTextures = async (video: HTMLVideoElement, scaledMesh: Coords3D) => {
  const entries = await Promise.all(
    Object.entries(KEY_AREA_GROUPS).map(async ([group, indices]) => {
      const { xMin, xMax, yMin, yMax } = calculateBounds(
        scaledMesh.filter((value, index) => indices.includes(index)),
      );
      const width = xMax - xMin;
      const height = yMax - yMin;
      const imageBitmap = await createImageBitmap(video, xMin, yMin, width, height);
      return [group, new CanvasTexture(imageBitmap as any)] as [
        keyof typeof KEY_AREA_GROUPS,
        CanvasTexture,
      ];
    }),
  );

  return (Object.fromEntries(entries) as unknown) as PartTextures;
};

export const store = createVanilla<State>((set, get) => ({
  canvasContext: undefined,
  video: undefined,
  image: undefined,
  videoPartTextures: undefined,
  getVideoPartTextures: async () => {
    const video = get().video?.source;
    const scaledMesh = get().video?.scaledMesh;

    if (!video || !scaledMesh) return undefined;

    const parts = await getVideoPartTextures(video, scaledMesh);
    set({ videoPartTextures: parts });

    return parts;
  },
  setNormalizedMesh: ({
    source,
    normalizedMesh,
    aspect: sourceAspect,
    normalizedBoundingBox,
    scaledMesh,
  }) => {
    const canvasContext = get().canvasContext;
    if (!canvasContext) return;

    const { viewport } = canvasContext;

    const isVideo = source instanceof HTMLVideoElement;

    const aspectCorrection = isVideo ? sourceAspect : 1;
    const mesh = getMesh(aspectCorrection, viewport, normalizedMesh);
    const boundingBox = getBoundingBox(aspectCorrection, viewport, normalizedBoundingBox);

    const parts = getParts(mesh);
    const facePlane = getFacePlane(mesh);
    const zRotation = getHeadZRotation(mesh);

    const keyPoints = {
      normalizedMesh,
      sourceAspect,
      mesh,
      parts,
      source,
      facePlane: { ...facePlane, zRotation },
      boundingBox,
      scaledMesh,
    };

    if (isVideo) {
      set({
        video: keyPoints as KeyPoints<HTMLVideoElement>,
      });
    } else {
      set({
        image: keyPoints as KeyPoints<HTMLImageElement>,
      });
    }
  },
  updateMeshes: () => {
    const { canvasContext, video, image } = get();
    if (!canvasContext) return;
    const { viewport } = canvasContext;

    if (video !== undefined) {
      const updatedKeyPoints = getUpdatedKeyPoints(video, viewport);
      set({ video: updatedKeyPoints });
    }

    if (image !== undefined) {
      const updatedKeyPoints = getUpdatedKeyPoints(image, viewport);
      set({ image: updatedKeyPoints });
    }
  },
  setCanvasContext: (canvasContext: SharedCanvasContext) => {
    set({ canvasContext });
  },
}));

export const useStore = createHook(store);

const getPlaneFromPoints = (
  pointA: Coord3D,
  pointB: Coord3D,
  pointC: Coord3D,
): { normal: Coord3D; offset: number } => {
  const A = new Vector3().fromArray(pointA);
  const B = new Vector3().fromArray(pointB);
  const C = new Vector3().fromArray(pointC);
  const AB = B.clone().sub(A);
  const AC = C.clone().sub(A);

  const normal = AB.clone().cross(AC);
  const offset = (normal.x * A.x, normal.y * A.y, normal.z * A.z);

  return { normal: normal.toArray() as Coord3D, offset };
};

function getUpdatedKeyPoints<T extends HTMLImageElement | HTMLVideoElement>(
  keyPoints: KeyPoints<T>,
  viewport: Viewport,
) {
  const { sourceAspect, normalizedMesh, source } = keyPoints;
  const isVideo = source instanceof HTMLVideoElement;
  const aspectCorrection = isVideo ? sourceAspect : 1;
  const mesh = getMesh(aspectCorrection, viewport, normalizedMesh);
  const parts = getParts(mesh);
  const facePlane = getFacePlane(mesh);
  const zRotation = getHeadZRotation(mesh);
  const updatedKeyPoints = {
    ...keyPoints,
    parts,
    facePlane: { ...facePlane, zRotation },
  };
  return updatedKeyPoints;
}

function getMesh(aspectCorrection: number, viewport: Viewport, normalizedMesh: Coords3D) {
  const scalingDimension = Math.min(viewport.width, viewport.height * aspectCorrection);

  const mesh: Coords3D = normalizedMesh.map(([x, y, z]) => [
    x * scalingDimension - scalingDimension / 2,
    (y * scalingDimension + scalingDimension / 2) / aspectCorrection,
    z * scalingDimension + scalingDimension / 2,
  ]);
  return mesh;
}

function getBoundingBox(
  aspectCorrection: number,
  viewport: Viewport,
  boundingBox: BoundingBox,
): BoundingBox {
  const scalingDimension = Math.min(viewport.width, viewport.height * aspectCorrection);

  return {
    topLeft: [
      boundingBox.topLeft[0] * scalingDimension - scalingDimension / 2,
      -(boundingBox.topLeft[1] * scalingDimension - scalingDimension / 2) / aspectCorrection,
    ],
    bottomRight: [
      boundingBox.bottomRight[0] * scalingDimension - scalingDimension / 2,
      -(boundingBox.bottomRight[1] * scalingDimension - scalingDimension / 2) / aspectCorrection,
    ],
  };
}

function getParts(mesh: Coords3D) {
  const entries = Object.entries(PART_GROUPS).map(([part, indices]) => [
    part,
    mesh.filter((_, index) => indices.includes(index)),
  ]);

  const parts = Object.fromEntries(entries) as {
    [key in PartGroups]: Coords3D;
  };
  return parts;
}

function getFacePlane(mesh: Coords3D) {
  const facePlanePoints: Coords3D = PART_GROUPS.FACE_PLANE.map((index) => mesh[index]!);

  if (facePlanePoints.length !== 3) {
    throw new Error('facePlanePoints should only contain three points');
  }

  const facePlane = getPlaneFromPoints(...(facePlanePoints as [Coord3D, Coord3D, Coord3D]));
  return facePlane;
}

function getHeadZRotation(mesh: Coords3D) {
  const facePlanePoints: Coords3D = PART_GROUPS.FACE_PLANE.map((index) => mesh[index]!);

  if (facePlanePoints.length !== 3) {
    throw new Error('facePlanePoints should only contain three points');
  }

  const [, leftCheek, rightCheeck] = facePlanePoints as [Coord3D, Coord3D, Coord3D];

  const distance = [rightCheeck[0] - leftCheek[0], rightCheeck[1] - leftCheek[1]] as Coord2D;
  const angle = -Math.atan2(distance[1], distance[0]);
  return angle;
}
