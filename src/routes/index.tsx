import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { onCleanup, onMount } from "solid-js";
import { OrbitControls } from "@/lib/orbitcontrols";

export default function Carver() {
		let canvas!: HTMLCanvasElement;

		onMount(() => {
			const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.setClearColor(0x000000, 1);

			const on_resize = () => {
				renderer.setSize(window.innerWidth, window.innerHeight);
				camera.aspect = canvas.width / canvas.height;
				camera.updateProjectionMatrix();
			}

		    window.addEventListener("resize", on_resize);

		    onCleanup(() => {
				window.removeEventListener("resize", on_resize);
			});

		    const camera = new THREE.PerspectiveCamera(
				75,
				canvas.width / canvas.height,
				0.1,
				150
			);

			const controls = new OrbitControls(camera, canvas);
			controls.maxDistance = 130;
			controls.minDistance = 60;
			controls.enablePan = false;

			camera.position.setX(100);
			controls.update();

			const scene = new THREE.Scene();

		    const loader = new GLTFLoader();

loader.load( '/pumpkin2.gltf', gltf => {
const bb = new THREE.Box3()
bb.setFromObject(gltf.scene);
bb.getCenter(controls.target);

	scene.add( gltf.scene );
});

				const light = new THREE.DirectionalLight(0xffffff, 3);
		scene.add(light);

			function render() {
			console.log(camera.position);
				light.position.set(camera.position.x, camera.position.y, camera.position.z);
				renderer.render(scene, camera);

				window.requestAnimationFrame(render);
			}

			window.requestAnimationFrame(render);
		});

		return <>
				<canvas ref={canvas}></canvas>
		</>
}
