import React, { useRef } from 'react';
import { useFrame } from 'react-three-fiber';
import { BufferAttribute, BufferGeometry, Color, Mesh, PointsMaterial } from 'three';
import { store } from './store';
import { PartGroups, PART_GROUPS } from './part-groups';

type Props = {
  parts: PartGroups[];
  color?: string | number | Color | undefined;
};

export const VideoPartRenderer = ({ parts, color = 'magenta' }: Props): React.ReactElement => {
  const ref = useRef<Mesh<BufferGeometry, PointsMaterial>>();
  const maxPoints = parts.map((part) => PART_GROUPS[part]).flat().length;

  useFrame(() => {
    const geometry = ref.current?.geometry;
    const partsInStore = store.getState().video?.parts;
    if (partsInStore === undefined) return;
    const mesh = parts.map((part) => partsInStore[part]).flat(2);
    if (geometry === undefined) return;

    const attribute = geometry.getAttribute('position') as BufferAttribute;
    attribute.set(mesh, 0);
    geometry.setDrawRange(0, maxPoints);
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref} key={parts.toString()}>
      <bufferGeometry drawRange={{ start: 0, count: 0 }}>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          itemSize={3}
          array={new Float32Array(maxPoints * 3)}
          count={maxPoints}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={10} />
    </points>
  );
};
