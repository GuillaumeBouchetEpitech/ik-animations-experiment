
import * as THREE from "three";

import * as glm from "gl-matrix";

interface WireframeStackRendererDef {
  maxItems?: number;
};

export class WireframeStackRenderer {

  private _maxItems: number;

  private _currVerticesIndex = 0;

  private _geometry = new THREE.BufferGeometry();
  private _material = new THREE.LineBasicMaterial({ vertexColors: true });
  private _attrPosition: THREE.Float32BufferAttribute;
  private _attrColor: THREE.Float32BufferAttribute;
  private _sceneObject: THREE.LineSegments;

  constructor(def?: WireframeStackRendererDef) {

    this._maxItems = def?.maxItems ?? 512;

    this._attrPosition = new THREE.Float32BufferAttribute(this._maxItems * 3 * 2, 3);
    this._attrColor = new THREE.Float32BufferAttribute(this._maxItems * 3 * 2, 3);
    this._geometry.setAttribute('position', this._attrPosition);
    this._geometry.setAttribute('color', this._attrColor);
    this._geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0,0,0), 1000);
    this._sceneObject = new THREE.LineSegments(this._geometry, this._material);
  }

  pushLine(
    posA: glm.ReadonlyVec3,
    posB: glm.ReadonlyVec3,
    color: glm.ReadonlyVec3,
  ): void {

    if (this._currVerticesIndex + 2 > this._maxItems * 2) {
      throw new Error(`WireframeStackRenderer, max size reached (maxItems: ${this._maxItems})`);
    }

    this._attrPosition.setComponent(this._currVerticesIndex, 0, posA[0]);
    this._attrPosition.setComponent(this._currVerticesIndex, 1, posA[1]);
    this._attrPosition.setComponent(this._currVerticesIndex, 2, posA[2]);
    this._attrColor.setComponent(this._currVerticesIndex, 0, color[0]);
    this._attrColor.setComponent(this._currVerticesIndex, 1, color[1]);
    this._attrColor.setComponent(this._currVerticesIndex, 2, color[2]);

    this._currVerticesIndex += 1;

    this._attrPosition.setComponent(this._currVerticesIndex, 0, posB[0]);
    this._attrPosition.setComponent(this._currVerticesIndex, 1, posB[1]);
    this._attrPosition.setComponent(this._currVerticesIndex, 2, posB[2]);
    this._attrColor.setComponent(this._currVerticesIndex, 0, color[0]);
    this._attrColor.setComponent(this._currVerticesIndex, 1, color[1]);
    this._attrColor.setComponent(this._currVerticesIndex, 2, color[2]);

    this._currVerticesIndex += 1;

    this._attrPosition.clearUpdateRanges();
    this._attrPosition.addUpdateRange(0, this._currVerticesIndex * 3);
    this._attrPosition.needsUpdate = true;
    this._attrColor.clearUpdateRanges();
    this._attrColor.addUpdateRange(0, this._currVerticesIndex * 3);
    this._attrColor.needsUpdate = true;
  }

  pushCross(center: glm.ReadonlyVec3, radius: number, color: glm.ReadonlyVec3): void {
    this.pushLine(
      [center[0]-radius, center[1], center[2]],
      [center[0]+radius, center[1], center[2]],
      color,
    );
    this.pushLine(
      [center[0], center[1]-radius, center[2]],
      [center[0], center[1]+radius, center[2]],
      color,
    );
    this.pushLine(
      [center[0], center[1], center[2]-radius],
      [center[0], center[1], center[2]+radius],
      color,
    );
  }

  asSceneObject() {
    return this._sceneObject;
  }

  sync() {
    this._geometry.setDrawRange(0, this._currVerticesIndex);
  }

  clear() {
    this._currVerticesIndex = 0;
    this.sync();
  }
}

