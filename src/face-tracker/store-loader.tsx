import { useCallback } from 'react';
import { useThree } from 'react-three-fiber';
import { useStore } from './store';

export const StoreLoader = (): null => {
  const canvasContext = useThree();
  const setCanvasContext = useStore(useCallback((state) => state.setCanvasContext, []));
  const updateMeshes = useStore(useCallback((state) => state.updateMeshes, []));

  setCanvasContext(canvasContext);
  updateMeshes();
  return null;
};
