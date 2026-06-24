import React from 'react';
import { usePCSettings } from '../../../hooks/usePC';
import { xrayMaterial } from '../materials';

export const XMesh = ({ children, material, ...props }: any) => {
  const { xrayMode } = usePCSettings();
  
  const filteredChildren = React.Children.map(children, (child) => {
    if (!child) return null;
    if (xrayMode) {
      if (child.type === 'meshStandardMaterial' || child.type === 'meshPhysicalMaterial' || child.type === 'primitive') {
        return null;
      }
    }
    return child;
  });
  
  return (
    <mesh material={xrayMode ? xrayMaterial : material} {...props}>
      {filteredChildren}
    </mesh>
  );
};
