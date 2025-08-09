
import * as THREE from "three";

import * as glm from "gl-matrix";


import { WireframeStackRenderer } from "./utilities/graphics/WireframeStackRenderer";
import * as easing from "./utilities/math/easing";
import { GenericEasing } from "./utilities/math/GenericEasing";
import { LimbData, circleCircleIntersectionPoints, ICircle } from "./utilities/math/inverse-kinematic";

//
//
//

const _lerp1D = (valA: number, valB: number, ratio: number) => {
  return valA + (valB - valA) * ratio;
};
const _lerp2D = (valA: glm.ReadonlyVec2, valB: glm.ReadonlyVec2, ratio: number) => {
  return glm.vec2.lerp(glm.vec2.create(), valA, valB, ratio);
};
const _lerp3D = (valA: glm.ReadonlyVec3, valB: glm.ReadonlyVec3, ratio: number) => {
  return glm.vec3.lerp(glm.vec3.create(), valA, valB, ratio);
};


export function renderWireframeOrigin(
  scene: THREE.Scene,
): (deltaTimeSec: number) => void {

  const wireframeStackRenderer = new WireframeStackRenderer({ maxItems: 3 });

  scene.add(wireframeStackRenderer.asSceneObject());

  wireframeStackRenderer.asSceneObject()

  //
  //
  //

  wireframeStackRenderer.clear();

  // just render the main axis
  wireframeStackRenderer.pushLine([0,0,0],[15,0,0],[1,0,0]); // X = red
  wireframeStackRenderer.pushLine([0,0,0],[0,15,0],[0,1,0]); // Y = green
  wireframeStackRenderer.pushLine([0,0,0],[0,0,15],[0,0,1]); // Z = blue

  wireframeStackRenderer.sync();

  //
  //
  //

  return function syncCallback() {
    // do nothing
  }
}



