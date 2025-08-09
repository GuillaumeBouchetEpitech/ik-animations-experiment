
import * as THREE from "three";

import * as glm from "gl-matrix";

interface BoxStackRendererDef {
  maxItems?: number;
};

export class BoxStackRenderer {

  private _maxItems: number;

  private _instancedMesh: THREE.InstancedMesh;
  private _dummyObject = new THREE.Object3D();
  private _dummyColor = new THREE.Color();

  constructor(def?: BoxStackRendererDef) {

    this._maxItems = def?.maxItems ?? 512;

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

    this._instancedMesh = new THREE.InstancedMesh(boxGeometry, whiteMaterial, this._maxItems);
    this._instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    this._instancedMesh.castShadow = true;
    this._instancedMesh.receiveShadow = true;
  }

  pushBox(
    pos: glm.ReadonlyVec3,
    quat: glm.ReadonlyQuat,
    scale: glm.ReadonlyVec3,
    color: glm.ReadonlyVec3,
  ) {

    this._dummyObject.position.set(pos[0], pos[1], pos[2]);
    this._dummyObject.quaternion.set(quat[0], quat[1], quat[2], quat[3]);
    this._dummyObject.scale.set(scale[0], scale[1], scale[2]);
    this._dummyObject.updateMatrix();

    this._dummyColor.set(color[0], color[1], color[2]);

    this._instancedMesh.setMatrixAt(this._instancedMesh.count, this._dummyObject.matrix);
    this._instancedMesh.setColorAt(this._instancedMesh.count, this._dummyColor);

    this._instancedMesh.count += 1;
    this._instancedMesh.instanceMatrix.needsUpdate = true;
  }

  asSceneObject() {
    return this._instancedMesh;
  }

  clear() {
    this._instancedMesh.count = 0;
  }
}
