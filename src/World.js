/**
 * @author Mugen87 / https://github.com/Mugen87
 */

import * as YUKA from "yuka";
import * as THREE from "three";
import { AssetManager } from "./AssetManager";
import { Bullet } from "./Bullet";
import { Ground } from "./Ground";
import { Player } from "./Player";
import { Target } from "./Target";
import { FirstPersonControls } from "./FirstPersonControls";
import { Renderer } from "expo-three";
import { Dimensions } from "react-native";
import { interfaceEmitter } from "./Emitter";
const target = new YUKA.Vector3();
const intersection = {
  point: new YUKA.Vector3(),
  normal: new YUKA.Vector3(),
};

class World {
  constructor() {
    this.maxBulletHoles = 20;

    this.entityManager = new YUKA.EntityManager();
    this.time = new YUKA.Time();

    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.audios = new Map();
    this.animations = new Map();

    this.player = null;
    this.controls = null;
    this.obstacles = new Array();
    this.bulletHoles = new Array();

    this.assetManager = new AssetManager();

    this._animate = animate.bind(this);

    this.ui = {
      loadingScreen: document.getElementById("loading-screen"),
    };
  }

  async init(gl) {
    await this.assetManager.init();
    this._initScene(gl);
    this._initGround();
    this._initPlayer();
    this._initControls();
    this._initTarget();
    this._initUI();

    // this._animate();
  }

  update() {
    const delta = this.time.update().getDelta();

    this.controls.update(delta);

    this.entityManager.update(delta);

    if (this.mixer) this.mixer.update(delta);

    this.renderer.render(this.scene, this.camera);
  }

  add(entity) {
    this.entityManager.add(entity);

    if (entity._renderComponent !== null) {
      this.scene.add(entity._renderComponent);
    }

    if (entity.geometry) {
      this.obstacles.push(entity);
    }
  }

  remove(entity) {
    this.entityManager.remove(entity);

    if (entity._renderComponent !== null) {
      this.scene.remove(entity._renderComponent);
    }

    if (entity.geometry) {
      const index = this.obstacles.indexOf(entity);

      if (index !== -1) this.obstacles.splice(index, 1);
    }
  }

  addBullet(owner, ray) {
    const bulletLine = this.assetManager.models.get("bulletLine").clone();

    const bullet = new Bullet(owner, ray);
    bullet.setRenderComponent(bulletLine, sync);

    this.add(bullet);
  }

  addBulletHole(position, normal, audio) {
    const bulletHole = this.assetManager.models.get("bulletHole").clone();
    bulletHole.add(audio);

    const s = 1 + Math.random() * 0.5;
    bulletHole.scale.set(s, s, s);

    bulletHole.position.copy(position);
    target.copy(position).add(normal);
    bulletHole.updateMatrix();
    bulletHole.lookAt(target.x, target.y, target.z);
    bulletHole.updateMatrix();

    if (this.bulletHoles.length >= this.maxBulletHoles) {
      const toRemove = this.bulletHoles.shift();
      this.scene.remove(toRemove);
    }

    this.bulletHoles.push(bulletHole);
    this.scene.add(bulletHole);
  }

  intersectRay(ray, intersectionPoint, normal = null) {
    const obstacles = this.obstacles;
    let minDistance = Infinity;
    let closestObstacle = null;

    for (let i = 0, l = obstacles.length; i < l; i++) {
      const obstacle = obstacles[i];

      if (
        obstacle.geometry.intersectRay(
          ray,
          obstacle.worldMatrix,
          false,
          intersection.point,
          intersection.normal
        ) !== null
      ) {
        const squaredDistance = intersection.point.squaredDistanceTo(
          ray.origin
        );

        if (squaredDistance < minDistance) {
          minDistance = squaredDistance;
          closestObstacle = obstacle;

          intersectionPoint.copy(intersection.point);
          if (normal) normal.copy(intersection.normal);
        }
      }
    }

    return closestObstacle === null ? null : closestObstacle;
  }

  _initScene(gl) {
    // camera
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    this.camera.matrixAutoUpdate = false;
    this.camera.add(this.assetManager.listener);

    // audios

    this.audios = this.assetManager.audios;

    // scene

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0a0a0);
    this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // lights

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 100, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 25;
    dirLight.position.set(5, 7.5, -10);
    dirLight.target.position.set(0, 0, -25);
    dirLight.target.updateMatrixWorld();
    this.scene.add(dirLight);

    // this.scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    // renderer

    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer = new Renderer({ gl, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.gammaOutput = true;
    // document.body.appendChild(this.renderer.domElement);

    // listeners

    Dimensions.addEventListener("change", this.onWindowResize);
  }

  onIntroClick = () => {
    this.controls.connect();

    const context = THREE.AudioContext.getContext();

    if (context.state === "suspended") context.resume();

    interfaceEmitter.emit("intro.hidden", true);
  };

  onWindowResize = ({ window }) => {
    this.camera.aspect = window.width / window.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.width * window.scale,
      window.height * window.scale
    );
  };

  _initGround() {
    const groundMesh = this.assetManager.models.get("ground");

    const vertices = groundMesh.geometry.attributes.position.array;
    const indices = groundMesh.geometry.index.array;

    const geometry = new YUKA.MeshGeometry(vertices, indices);
    const ground = new Ground(geometry);
    ground.setRenderComponent(groundMesh, sync);

    this.add(ground);
  }

  _initPlayer() {
    const player = new Player();
    player.head.setRenderComponent(this.camera, syncCamera);

    this.add(player);
    this.player = player;

    // weapon

    const weapon = player.weapon;
    const weaponMesh = this.assetManager.models.get("weapon");
    weapon.setRenderComponent(weaponMesh, sync);
    this.scene.add(weaponMesh);

    weaponMesh.add(this.audios.get("shot"));
    weaponMesh.add(this.audios.get("reload"));
    weaponMesh.add(this.audios.get("empty"));

    // animations

    this.mixer = new THREE.AnimationMixer(player.weapon);

    const shotClip = this.assetManager.animations.get("shot");
    const shotAction = this.mixer.clipAction(shotClip);
    shotAction.loop = THREE.LoopOnce;

    this.animations.set("shot", shotAction);

    const reloadClip = this.assetManager.animations.get("reload");
    const reloadAction = this.mixer.clipAction(reloadClip);
    reloadAction.loop = THREE.LoopOnce;

    this.animations.set("reload", reloadAction);
  }

  _initControls() {
    const player = this.player;

    this.controls = new FirstPersonControls(player);
    this.controls.lookSpeed = 2;

    this.controls.addEventListener("lock", () => {
      interfaceEmitter.emit("intro.hidden", true);
      interfaceEmitter.emit("reticle.hidden", false);
    });

    this.controls.addEventListener("unlock", () => {
      interfaceEmitter.emit("intro.hidden", false);
      interfaceEmitter.emit("reticle.hidden", true);
    });
  }

  _initTarget() {
    const targetMesh = this.assetManager.models.get("target");

    const vertices = targetMesh.geometry.attributes.position.array;
    const indices = targetMesh.geometry.index.array;

    const geometry = new YUKA.MeshGeometry(vertices, indices);
    const target = new Target(geometry);
    target.position.set(0, 5, -20);
    target.setRenderComponent(targetMesh, sync);

    this.add(target);
  }

  _initUI() {
    interfaceEmitter.emit("loading.hidden", true);
  }
}

function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

function syncCamera(entity, renderComponent) {
  renderComponent.matrixWorld.copy(entity.worldMatrix);
}

function onTransitionEnd(event) {
  event.target.remove();
}

function animate() {
  requestAnimationFrame(this._animate);

  this.update();
}

export default new World();
