import React from 'react';
import { usePCView } from '../../../hooks/usePC';
import { xrayMaterial } from '../materials';
import { Instances } from '@react-three/drei';

type MeshProps = React.ComponentProps<'mesh'>;

export const XMesh = ({ children, material, ...props }: MeshProps) => {
  const xrayMode = usePCView(s => s.xrayMode);
  
  const filteredChildren = React.Children.map(children, (child) => {
    if (!child || !React.isValidElement(child)) return null;
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

type InstancesProps = React.ComponentProps<typeof Instances>;

export const XInstances = ({ children, material, ...props }: InstancesProps) => {
  const xrayMode = usePCView(s => s.xrayMode);
  const filteredChildren = React.Children.map(children, (child) => {
    if (!child || !React.isValidElement(child)) return null;
    if (xrayMode) {
      if (child.type === 'meshStandardMaterial' || child.type === 'meshPhysicalMaterial' || child.type === 'primitive') {
        return null;
      }
    }
    return child;
  });
  
  return (
    <Instances material={xrayMode ? xrayMaterial : material} {...props}>
      {filteredChildren}
    </Instances>
  );
};
