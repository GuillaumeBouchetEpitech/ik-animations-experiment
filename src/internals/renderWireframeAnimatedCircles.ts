
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


export function renderWireframeAnimatedCircles(
  scene: THREE.Scene,
): (deltaTimeSec: number) => void {

  const wireframeStackRenderer = new WireframeStackRenderer({ maxItems: 100 });

  scene.add(wireframeStackRenderer.asSceneObject());

  // move around in the scene
  wireframeStackRenderer.asSceneObject().position.set(15, -5, 10);

  //
  //
  //



  //
  //
  //

  let continuousTime = 0;

  return function syncCallback(deltaTimeSec: number) {

    continuousTime += deltaTimeSec * 1.0;

    wireframeStackRenderer.clear();

    //
    //
    //

    //
    //
    //

    //
    //
    //

    const posX = 0;
    const posY = 0;

    const animRatio = easing.easeClamp(continuousTime * 0.25);


    const allWaypoints: glm.ReadonlyVec2[] = [
      [6 + 2 * 0, 0.5 + 3 * 0],
      [6 + 2 * 1, 0.5 + 3 * 1],
      [6 + 2 * 0, 0.5 + 3 * 1],
      [6 + 2 * 1, 0.5 + 3 * 0],
    ];

    const customEasing = new GenericEasing<glm.vec2>(_lerp2D);
    customEasing.push(1/4*0, allWaypoints[0]);
    customEasing.push(1/4*1, allWaypoints[1]);
    customEasing.push(1/4*2, allWaypoints[2]);
    customEasing.push(1/4*3, allWaypoints[3]);
    customEasing.push(1/4*4, allWaypoints[0]);

    const ikTarget = customEasing.get(animRatio);

    const circleA: ICircle = {
      center: [0,0],
      radius: 6
    };
    const circleB: ICircle = {
      center: ikTarget,
      radius: 5
    };
    const result = circleCircleIntersectionPoints(circleA, circleB);

    { // draw circles center

      const k_color: glm.ReadonlyVec3 = [1,1,1];

      wireframeStackRenderer.pushCross([posX+circleA.center[0],posY,circleA.center[1]], 1.5, k_color);
      wireframeStackRenderer.pushCross([posX+circleB.center[0],posY,circleB.center[1]], 1.5, k_color);

    } // draw circles center

    { // draw circles shape

      const k_color: glm.ReadonlyVec3 = [0.3,0.3,0.3];

      const k_quality = 32;
      for (let ii = 0; ii < k_quality; ii += 2) {
        const jj = (ii + 1) % k_quality;

        const angleA = (ii / k_quality) * Math.PI * 2;
        const angleB = (jj / k_quality) * Math.PI * 2;
        const cosA = Math.cos(angleA);
        const sinA = Math.sin(angleA);
        const cosB = Math.cos(angleB);
        const sinB = Math.sin(angleB);

        wireframeStackRenderer.pushLine(
          [posX+circleA.center[0]+cosA*circleA.radius,posY+0,circleA.center[1]+sinA*circleA.radius],
          [posX+circleA.center[0]+cosB*circleA.radius,posY+0,circleA.center[1]+sinB*circleA.radius],
          k_color);

        wireframeStackRenderer.pushLine(
          [posX+circleB.center[0]+cosA*circleB.radius,posY+0,circleB.center[1]+sinA*circleB.radius],
          [posX+circleB.center[0]+cosB*circleB.radius,posY+0,circleB.center[1]+sinB*circleB.radius],
          k_color);
      }

    } // draw circles shape

    { // draw waypoints

      for (let ii = 0; ii < allWaypoints.length; ++ii) {
        const jj = (ii + 1) % allWaypoints.length;

        const posA = allWaypoints[ii];
        const posB = allWaypoints[jj];

        wireframeStackRenderer.pushLine(
          [posX+posA[0], posY, posA[1]],
          [posX+posB[0], posY, posB[1]],
          [1.0,1.0,1.0]);
      }

    } // draw waypoints

    { // draw "arms"

      if (result) {
        result.forEach((intersectionPoint, index) => {

          const k_color: glm.ReadonlyVec3 = ((index % 2) == 0) ? [1.0,0.3,0.3] : [0.3,0.3,1.0];

          wireframeStackRenderer.pushCross(
            [posX+intersectionPoint[0],posY,intersectionPoint[1]],
            1.0,
            k_color
          );

          for (let ii = 0; ii <= 0; ++ii) {

            // arm of circleA
            wireframeStackRenderer.pushLine(
              [posX+circleA.center[0],posY+ii,circleA.center[1]],
              [posX+intersectionPoint[0],posY+ii,intersectionPoint[1]],
              k_color);

            // arm of circleB
            wireframeStackRenderer.pushLine(
              [posX+circleB.center[0],posY+ii,circleB.center[1]],
              [posX+intersectionPoint[0],posY+ii,intersectionPoint[1]],
              k_color);
          }

        });
      }
    } // draw "arms"

    //
    //
    //

    //
    //
    //

    //
    //
    //

    wireframeStackRenderer.sync();
  }
}



