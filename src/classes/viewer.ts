import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';

export class Viewer {
  private camera: THREE.PerspectiveCamera;
  private dirLight: THREE.DirectionalLight;
  private controls: OrbitControls;
  private lightmap: THREE.Texture;
  private albedo: THREE.Texture;
  private readonly scene = new THREE.Scene();
  private readonly material: THREE.MeshBasicMaterial;

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly canvas: HTMLCanvasElement
  ) {
    this.initCamera();
    //this.initLighting();
    this.initHDR();
    this.initControls();
    this.initMeshes();

    this.material = new THREE.MeshBasicMaterial();
  }

  toggleLightmap(active: boolean) {
    this.material.lightMap = active ? this.lightmap : undefined;
    this.material.needsUpdate = true;
  }

  toggleAlbedo(active: boolean) {
    this.material.map = active ? this.albedo : undefined;
    this.material.color = active
      ? new THREE.Color(0xffffff)
      : new THREE.Color(0x7f7f7f);
    this.material.needsUpdate = true;
  }

  readonly update = (dt: number) => {
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  };

  readonly resize = () => {
    console.log('resizing');
    this.renderer.setSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      false
    );
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
  };

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight
    );
    this.camera.position.set(
      -87.22146435305366,
      53.468298181330724,
      121.82803529654234
    );

    this.scene.add(this.camera);
  }

  private initLighting() {
    this.dirLight = new THREE.DirectionalLight();
    this.dirLight.position.set(1, 1, 1);

    this.scene.add(this.dirLight);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.dampingFactor = 0.05;
    this.controls.enableDamping = true;

    this.controls.target.set(0, -30, 0);
  }

  private async initHDR() {
    const loader = new RGBELoader();
    const texture = await loader.loadAsync('./assets/cape_hill_2k_Env.hdr');

    texture.mapping = THREE.EquirectangularReflectionMapping;

    this.scene.environment = texture;
    this.scene.background = texture;
  }

  private async initMeshes() {
    const fbxLoader = new FBXLoader();
    const textureLoader = new THREE.TextureLoader();
    const hdrLoader = new RGBELoader();

    const terrain = await fbxLoader.loadAsync('./assets/meshes/terrain.fbx');

    terrain.rotateY(Math.PI / 2);

    this.albedo = await textureLoader.loadAsync('./assets/textures/albedo.png');
    // const normal = await textureLoader.loadAsync(
    //   './assets/textures/normal.png'
    // );
    this.lightmap = await hdrLoader.loadAsync('./assets/textures/lightmap.hdr');

    this.albedo.encoding = THREE.sRGBEncoding;
    //normal.encoding = THREE.LinearEncoding;
    this.lightmap.encoding = THREE.LinearEncoding;

    if (!terrain || !this.lightmap /*|| !normal*/) {
      throw new Error('Failed to load assets!');
    }

    this.material.map = this.albedo;
    this.material.lightMap = this.lightmap;

    terrain.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.material = this.material;
      }
    });

    this.scene.add(terrain);
  }
}
