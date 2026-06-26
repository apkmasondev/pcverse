import React from 'react';
import { usePCView } from '../../../hooks/usePC';
import { xrayMaterial } from '../materials';

export const XMesh = ({ children, material, ...props }: any) => {
  const { xrayMode } = usePCView();
  
  const filteredChildren = React.Children.map(children, (child) => {
    if (!child) return null;
    if (xrayMode) {
      const isGeometry = typeof child.type === 'string' && child.type.endsWith('Geometry');
      return isGeometry ? child : null;
    }
    return child;
  });
  
  return (
    <mesh material={xrayMode ? xrayMaterial : material} {...props}>
      {filteredChildren}
    </mesh>
  );
};
