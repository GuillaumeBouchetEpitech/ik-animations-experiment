
import * as THREE from "three";

import * as glm from "gl-matrix";


import { BoxStackRenderer } from "./utilities/graphics/BoxStackRenderer";
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


export function renderWireframeAnimatedHumanoidWalking(
  scene: THREE.Scene,
): (deltaTimeSec: number) => void {

  const boxStackRenderer = new BoxStackRenderer({ maxItems: 100 });
  const wireframeStackRenderer = new WireframeStackRenderer({ maxItems: 1000 });

  scene.add(boxStackRenderer.asSceneObject());
  scene.add(wireframeStackRenderer.asSceneObject());

  // move around in the scene
  boxStackRenderer.asSceneObject().position.set(-5, +20, 0);
  wireframeStackRenderer.asSceneObject().position.set(-5, +20, 0);

  //
  //
  //

  let continuousTime = 0;

  return function syncCallback(deltaTimeSec: number) {

    continuousTime += deltaTimeSec * 1.0;

    { // scene rotation over time

      const angleZ = easing.easeClamp(continuousTime * (1/32));

      const quat = new THREE.Quaternion();
      quat.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI * 2 * angleZ);

      boxStackRenderer.asSceneObject().rotation.setFromQuaternion(quat);
      wireframeStackRenderer.asSceneObject().rotation.setFromQuaternion(quat);

    } // scene rotation over time

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

    boxStackRenderer.clear();

    const k_rootPos: glm.ReadonlyVec3 = [0,0,0];

    { // render walking legs

      const debugLegAnimation = (
        mainOrigin: glm.ReadonlyVec3,
        reverseY: boolean,
        animRawRatio: number,
      ): void => {

        // debug leg animation
        const coefY = reverseY ? -1 : 1;

        const allWaypoints: glm.ReadonlyVec3[] = [
          [mainOrigin[0]+6 - 8.0,mainOrigin[1]-1 * coefY,mainOrigin[2]-9 + 1.5*0],
          [mainOrigin[0]+6 - 5.5,mainOrigin[1]-0 * coefY,mainOrigin[2]-9 + 1.5*1],
          [mainOrigin[0]+6 - 3.0,mainOrigin[1]-1 * coefY,mainOrigin[2]-9 + 1.5*0],
        ];

        const customEasing = new GenericEasing<glm.vec3>(_lerp3D)
          .push(0.00, allWaypoints[0]) // ground
          .push(1/2*0.5*1, allWaypoints[1])
          .push(1/2*0.5*2, allWaypoints[2])
          .push(1.00, allWaypoints[0])
          ;


        // render waypoints
        for (let currIndex = 0; currIndex < allWaypoints.length; ++currIndex) {
          const nextIndex = (currIndex + 1) % allWaypoints.length;

          const posA = allWaypoints[currIndex];
          const posB = allWaypoints[nextIndex];

          wireframeStackRenderer.pushLine(posA, posB, [0,1,0]);
        }

        // determine next target
        const mainTarget = customEasing.get(animRawRatio);

        { // cross on the main origin
          wireframeStackRenderer.pushLine([mainOrigin[0],mainOrigin[1],mainOrigin[2]], [mainOrigin[0]+3,mainOrigin[1]+0,mainOrigin[2]+0], [1.0,0.0,0.0]);
          wireframeStackRenderer.pushLine([mainOrigin[0],mainOrigin[1],mainOrigin[2]], [mainOrigin[0]+0,mainOrigin[1]+3,mainOrigin[2]+0], [0.0,1.0,0.0]);
          wireframeStackRenderer.pushLine([mainOrigin[0],mainOrigin[1],mainOrigin[2]], [mainOrigin[0]+0,mainOrigin[1]+0,mainOrigin[2]+3], [0.0,0.0,1.0]);
        }
        { // cross on the main target
          wireframeStackRenderer.pushLine(mainTarget, [mainTarget[0]+3,mainTarget[1]+0,mainTarget[2]+0], [1.0,0.5,0.5]);
          wireframeStackRenderer.pushLine(mainTarget, [mainTarget[0]+0,mainTarget[1]+3,mainTarget[2]+0], [0.5,1.0,0.5]);
          wireframeStackRenderer.pushLine(mainTarget, [mainTarget[0]+0,mainTarget[1]+0,mainTarget[2]+3], [0.5,0.5,1.0]);
        }

        const rootMat4 = glm.mat4.identity(glm.mat4.create());
        glm.mat4.translate(rootMat4, rootMat4, mainOrigin);
        glm.mat4.rotate(rootMat4, rootMat4, Math.PI * -0.5, [0,1,0]); // "look down"

        const limbData = new LimbData(rootMat4, 5, 5);
        const result = limbData.computeIk_fixedRoll(mainTarget,[0,0,1]);
        if (result) {

          const baseMat4 = glm.mat4.identity(glm.mat4.create());
          const primaryMat4 = glm.mat4.identity(glm.mat4.create());
          const secondaryMat4 = glm.mat4.identity(glm.mat4.create());

          {

            const k_color: glm.ReadonlyVec3 = [0,1,0];

            // -> jointA is above ground
            limbData.extractTransforms(result, result.jointA, baseMat4, primaryMat4, secondaryMat4);

            const _subRender = (currMat4: glm.ReadonlyMat4, length: number) => {

              const rawOrigin = glm.vec3.fromValues(0,0,0);
              const rawForward = glm.vec3.fromValues(length,0,0);
              const rawLeft = glm.vec3.fromValues(0,1,0);
              const rawUp = glm.vec3.fromValues(0,0,1);

              const origin: glm.ReadonlyVec3 = glm.vec3.transformMat4(rawOrigin, rawOrigin, currMat4);
              const forward: glm.ReadonlyVec3 = glm.vec3.transformMat4(rawForward, rawForward, currMat4);
              const left: glm.ReadonlyVec3 = glm.vec3.transformMat4(rawLeft, rawLeft, currMat4);
              const up: glm.ReadonlyVec3 = glm.vec3.transformMat4(rawUp, rawUp, currMat4);

              wireframeStackRenderer.pushLine(origin, forward, [1,0,0]);
              wireframeStackRenderer.pushLine(origin, left, [0,1,0]);
              wireframeStackRenderer.pushLine(origin, up, [0,0,1]);

              boxStackRenderer.pushBox(
                glm.vec3.lerp(glm.vec3.create(), origin, forward, 0.5),
                glm.quat.fromMat3(glm.quat.create(), glm.mat3.fromMat4(glm.mat3.create(), currMat4)),
                [length,1,0.5],
                k_color,
              );
            };

            _subRender(baseMat4, 1);
            _subRender(primaryMat4, limbData.primaryLength);
            _subRender(secondaryMat4, limbData.secondaryLength);

          }

        }

      };


      debugLegAnimation([k_rootPos[0], k_rootPos[1]+1.2, k_rootPos[2] + 1.75], false, easing.easeClamp(continuousTime * 0.5 + 0.00));
      debugLegAnimation([k_rootPos[0], k_rootPos[1]-1.2, k_rootPos[2] + 1.75], true, easing.easeClamp(continuousTime * 0.5 + 0.50));


      { // render floor

        const ratio = easing.easeClamp(continuousTime * 1.5);

        for (let xx = 0; xx < 2; ++xx) {
          for (let yy = 1; yy < 2; ++yy) {
            boxStackRenderer.pushBox(
              [
                k_rootPos[0] + 22 - ratio * 5 - (xx+3) * 5,
                k_rootPos[1] - 15 + (yy+2) * 5,
                k_rootPos[2] - 7.75
              ],
              glm.quat.identity(glm.quat.create()),
              [4.8,4.8,1],
              [0.5,0.5,1.0],
            );
          }
        }

      } // render floor

    } // render walking legs

    wireframeStackRenderer.sync();
  }
}



