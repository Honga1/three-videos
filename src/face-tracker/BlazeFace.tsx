import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs-core';
import React, { ReactElement, useEffect, useRef } from 'react';
import { Canvas } from 'react-three-fiber';
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Face3,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Vector3,
} from 'three';
import { useAnimationFrame } from '../ChainableAsyncVideos';
import { store } from '../Store';

const vertices = [
  new Vector3(0, 0, 0),
  new Vector3(100, 0, 0),
  new Vector3(100, 100, 0),
  new Vector3(0, 100, 0),
];
const faces = [new Face3(0, 1, 3), new Face3(1, 2, 3)];

export const BlazeFace = ({ stream }: { stream: MediaStream }): ReactElement => {
  const maxPoints = 50;
  const modelRef = useRef<blazeface.BlazeFaceModel>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const pointsRef = useRef<Points<BufferGeometry, PointsMaterial>>();
  const rectRef = useRef<Mesh<Geometry, MeshBasicMaterial>>();
  useEffect(() => {
    const effect = async () => {
      if (!videoRef.current) return;
      await tf.setBackend('webgl');
      const video = videoRef.current;
      video.width = stream.getTracks()[0]!.getSettings().width!;
      video.height = stream.getTracks()[0]!.getSettings().height!;
      video.srcObject = stream;
      video.play();
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video);
        };
      });
      modelRef.current = await blazeface.load({ maxFaces: 1 });
      const predictions = await modelRef.current.estimateFaces(video, false, true, true);
    };

    effect();
  }, [stream, videoRef]);

  const bothDrawnRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  useEffect(() => {
    const video = videoRef.current;
    const bothDrawn = bothDrawnRef.current;

    if (!video || !bothDrawn) return;

    bothDrawn.width = 1920;
    bothDrawn.height = 1080;

    store.setState({
      detectorCanvas: bothDrawn,
    });
  });

  const isTracking = () => store.getState().isTracking;
  useAnimationFrame(30, async () => {
    const enabled = store.getState().currentPlaybackTrack === 1;
    if (!enabled) return;

    if (!isTracking()) store.getState().setIsTracking(true);
    if (
      !videoRef.current ||
      !modelRef.current ||
      !pointsRef.current ||
      !bothDrawnRef.current ||
      !rectRef.current
    )
      return;
    const rect = rectRef.current;
    const video = videoRef.current;
    const model = modelRef.current;
    const predictions = await model.estimateFaces(video, false, true, true);
    if (predictions.length === 0) return;
    const geometry = pointsRef.current.geometry;
    const attribute = geometry.getAttribute('position') as BufferAttribute;

    const displayedSize = video.getBoundingClientRect();
    const points = predictions
      .map((prediction) => prediction.landmarks as [x: number, y: number][])
      .flat();

    const threeCoords = (trackX: number, trackY: number) => {
      const x = (trackX! / video.width) * displayedSize.width - displayedSize.width / 2;
      const y = (trackY! / video.height) * displayedSize.height - displayedSize.height / 2;

      return [-x, -y] as const;
    };
    for (let pointIndex = 0; pointIndex < maxPoints; pointIndex++) {
      const [trackX, trackY] = points[pointIndex] || [2000, 2000];
      const [x, y] = threeCoords(trackX, trackY);
      attribute.set([x, y, 0], pointIndex * 3);
    }
    attribute.needsUpdate = true;

    const topLeft = threeCoords(...(predictions[0]!.topLeft as [number, number]));
    const bottomRight = threeCoords(...(predictions[0]!.bottomRight as [number, number]));
    const bottomLeft = [topLeft[0], bottomRight[1]] as const;
    const topRight = [bottomRight[0], topLeft[1]] as const;

    rect.geometry.vertices[0]?.set(...topLeft, 0);
    rect.geometry.vertices[1]?.set(...topRight, 0);
    rect.geometry.vertices[2]?.set(...bottomRight, 0);
    rect.geometry.vertices[3]?.set(...bottomLeft, 0);
    rect.geometry.verticesNeedUpdate = true;
    rect.geometry.computeFaceNormals();
  });

  useAnimationFrame(30, async () => {
    const enabled = store.getState().currentPlaybackTrack === 1;
    if (!enabled) return;

    const canvasContainer = document.getElementById('CanvasPoints') as HTMLDivElement | null;

    if (!videoRef.current || !canvasContainer || !bothDrawnRef.current) return;

    const canvas = canvasContainer.firstChild as HTMLCanvasElement | null;
    if (!canvas) return;

    const video = videoRef.current;
    const bothDrawn = bothDrawnRef.current;

    const aspect = video.videoWidth / video.videoHeight;
    canvasContainer.style.width = video.getBoundingClientRect().width + 'px';
    canvasContainer.style.height = video.getBoundingClientRect().width / aspect + 'px';

    const context = bothDrawn.getContext('2d')!;
    if (aspect < 1.777) {
      // Should pad sides
      const offsetX = (bothDrawn.width - bothDrawn.height * aspect) / 2;

      const offsetY = 0;
      context.clearRect(0, 0, bothDrawn.width, bothDrawn.height);
      const width = bothDrawn.width - offsetX * 2;
      const height = bothDrawn.height - offsetY * 2;
      context.drawImage(video, offsetX, offsetY, width, height);
      context.drawImage(canvas, offsetX, offsetY, width, height);
    } else {
      // Should pad tops
      const offsetX = 0;
      const offsetY = (bothDrawn.height - bothDrawn.width / aspect) / 2;
      context.clearRect(0, 0, bothDrawn.width, bothDrawn.height);
      context.drawImage(
        video,
        offsetX,
        offsetY,
        bothDrawn.width - offsetX * 2,
        bothDrawn.height - offsetY * 2,
      );
      context.drawImage(
        canvas,
        offsetX,
        offsetY,
        bothDrawn.width - offsetX * 2,
        bothDrawn.height - offsetY * 2,
      );
    }
  });

  return (
    <>
      <div style={{ opacity: 0.0, width: '100%', position: 'absolute' }}>
        <video
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
          width="100%"
          autoPlay
          height="100%"
          ref={videoRef}
        ></video>

        <Canvas
          id="CanvasPoints"
          style={{
            width: '100%',
          }}
          orthographic={true}
          pixelRatio={window.devicePixelRatio}
          webgl1={true}
          camera={{ near: -10000, far: 10000 }}
          noEvents={true}
          onPointerMove={undefined}
          onMouseMove={undefined}
        >
          <mesh ref={rectRef}>
            <geometry vertices={vertices} faces={faces} />
            <meshBasicMaterial color="red" side={DoubleSide} opacity={0.2} transparent />
          </mesh>
          <points ref={pointsRef}>
            <bufferGeometry drawRange={{ start: 0, count: maxPoints }}>
              <bufferAttribute
                attachObject={['attributes', 'position']}
                itemSize={3}
                array={new Float32Array(maxPoints * 3)}
                count={maxPoints}
              />
            </bufferGeometry>
            <pointsMaterial color={'green'} size={10} />
          </points>
        </Canvas>
      </div>
    </>
  );
};
