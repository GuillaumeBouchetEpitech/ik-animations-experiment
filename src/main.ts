
import * as THREE from "three";

import Stats from 'stats.js'

import { renderWireframeAnimatedCircles } from "./internals/renderWireframeAnimatedCircles";
import { renderWireframeAnimatedHumanoidStrafing } from "./internals/renderWireframeAnimatedHumanoidStrafing";
import { renderWireframeAnimatedHumanoidWalking } from "./internals/renderWireframeAnimatedHumanoidWalking";
import { renderWireframeAnimatedSpiderBot } from "./internals/renderWireframeAnimatedSpiderBot";
import { renderWireframeOrigin } from "./internals/renderWireframeOrigin";


const _queryHtmlElem = <T extends HTMLElement>(elemId: string): T => {
  const newElement: T | null = document.querySelector<T>(elemId);
  if (!newElement) {
    throw new Error(`html element not found -> '${elemId}'`);
  }
  return newElement;
};

window.onload = async () => {

  // initial logging function
  let _doLog = (...args: any[]) => {
    console.log(...args);
  };

  try {

    const textAreaElement = _queryHtmlElem<HTMLTextAreaElement>("#loggerOutput");

    // "upgrade" logging function
    _doLog = (...args: any[]) => {
      console.log(...args);
      textAreaElement.value += `> ${args.join(', ')}\n`;
    };

    _doLog('✅ page loaded');

    const renderArea = _queryHtmlElem<HTMLDivElement>("#render-area")

    const stats = new Stats()
    stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    _doLog('✅ fps meter loaded');

    //
    // simulate
    //

    const width = 800;
    const height = 600;

    const camera = new THREE.PerspectiveCamera( 70, width / height, 0.1, 80 );

    // camera

    camera.position.set(35,25,5);
    camera.up.set(0,0,1);
    camera.lookAt(5,0,0);

    const scene = new THREE.Scene();

    {
      const light = new THREE.AmbientLight( 0x666666 ); // soft white light
      scene.add( light );
    }

    {
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(-10, 10, 10);
      directionalLight.lookAt(0, 0, 0);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 1024;
      directionalLight.shadow.mapSize.height = 1024;
      directionalLight.shadow.camera.near = 1;
      directionalLight.shadow.camera.far = 80;
      directionalLight.shadow.camera.left = -70;
      directionalLight.shadow.camera.right = 70;
      directionalLight.shadow.camera.top = 70;
      directionalLight.shadow.camera.bottom = -70;
      directionalLight.shadow.bias = 0.00001;
      scene.add( directionalLight );
    }


    const toSync: ((deltaTimeSec: number) => void)[] = [
      renderWireframeAnimatedCircles(scene),
      renderWireframeAnimatedHumanoidStrafing(scene),
      renderWireframeAnimatedHumanoidWalking(scene),
      renderWireframeAnimatedSpiderBot(scene),
      renderWireframeOrigin(scene),
    ];

    _doLog('✅ simulation setup');

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x202020, 1.0);
    renderer.setSize(width, height);
    renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // quality-- speed++
    // renderer.shadowMap.type = THREE.PCFShadowMap; // quality+ speed-
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap; // quality++ speed--
    renderArea.appendChild(renderer.domElement);
    renderer.domElement.style.width = "800px";
    renderer.domElement.style.height = "600px";

    _doLog('✅ threejs renderer setup');

    let lastTimeMsec = 0;
    function animate( timeMsec: number ) {

      stats.end();
      stats.begin();

      // console.log(scene.children.length)

      const maxDelta = 1000/30; // max delta time of 30ps (in case of graphic lag)
      const deltaTimeMsec = Math.min(timeMsec - lastTimeMsec, maxDelta);
      lastTimeMsec = timeMsec;

      const deltaTimeSec = deltaTimeMsec / 1000;

      toSync.forEach(syncCallback => syncCallback(deltaTimeSec));

      renderer.clear();
      renderer.clearColor();
      renderer.clearDepth();
      renderer.clearStencil();
      renderer.render( scene, camera );
    }

    _doLog('✅ main loop setup');
  } catch (err: any) {
    _doLog(`❌ Error: "${err.message}".`);
  }
};





