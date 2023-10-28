import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createSignal, onCleanup, onMount } from "solid-js";
import { OrbitControls } from "@/lib/orbitcontrols";

function performStroke(
	hit: THREE.Intersection<THREE.Mesh>,
	max_dist: number,
	strength: number
) {
	if (!hit.object.geometry) {
		return;
	}

	const mesh = hit.object;
	const geometry = mesh.geometry;
	const point = hit.point;

	const pos = geometry.getAttribute("position");
	const vec = new THREE.Vector3();
	const md_sq = max_dist ** 2;
	const D = strength + 1;

	for (let i = 0; i < pos.count; i++) {
		vec.fromBufferAttribute(pos, i);

		const toWorld = mesh.localToWorld(vec);
		const sq_distance = point.distanceToSquared(toWorld);

		if (sq_distance >= md_sq) {
			continue;
		}

		pos.setXYZ(i, pos.getX(i) * D, pos.getY(i) * D, pos.getZ(i) * D);
	}
	geometry.computeVertexNormals();
	pos.needsUpdate = true;
}

export default function Carver() {
	const [strength, setStrength] = createSignal<number>(-0.01);
	const [size, setSize] = createSignal<number>(3);

	let canvas!: HTMLCanvasElement;
	let strength_input!: HTMLInputElement;
	let size_input!: HTMLInputElement;

	onMount(() => {
		strength_input.value = strength() as unknown as string;
		size_input.value = size() as unknown as string;
	});

	onMount(() => {
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		renderer.setClearColor(new THREE.Color(0x000000));
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);

		const on_resize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = canvas.width / canvas.height;
			camera.updateProjectionMatrix();
		};

		{
			const mouse = new THREE.Vector2();
			const raycaster = new THREE.Raycaster();

			const on_mousemove = (e: MouseEvent) => {
				let canvasBounds = canvas.getBoundingClientRect();
				mouse.x =
					((e.clientX - canvasBounds.left) /
						(canvasBounds.right - canvasBounds.left)) *
						2 -
					1;
				mouse.y =
					-(
						(e.clientY - canvasBounds.top) /
						(canvasBounds.bottom - canvasBounds.top)
					) *
						2 +
					1;

				if (!pumpkin) {
					return;
				}

				raycaster.setFromCamera(mouse, camera);
				const hit = raycaster.intersectObject(pumpkin!.children[0]);

				if (hit.length === 0) {
					return;
				}

				// If mouse is released or not above pumpkin
				if (controls.enabled) {
					return;
				}

				performStroke(
					hit[0] as THREE.Intersection<THREE.Mesh>,
					size(),
					strength()
				);
			};

			const on_mousedown = () => {
				raycaster.setFromCamera(mouse, camera);

				const intersects = raycaster.intersectObjects(
					pumpkin!.children
				);
				controls.enabled = intersects.length === 0;
			};

			const on_mouseup = () => {
				controls.enabled = true;
			};

			window.addEventListener("resize", on_resize);
			window.addEventListener("mousedown", on_mousedown);
			window.addEventListener("mouseup", on_mouseup);
			window.addEventListener("mousemove", on_mousemove);

			onCleanup(() => {
				window.removeEventListener("resize", on_resize);
				window.removeEventListener("mousedown", on_mousedown);
				window.removeEventListener("mouseup", on_mouseup);
				window.removeEventListener("mousemove", on_mousemove);
			});
		}

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

		const scene = new THREE.Scene();

		const loader = new GLTFLoader();
		let pumpkin: THREE.Object3D<THREE.Object3DEventMap> | null = null;

		loader.load("/pumpkin.glb", gltf => {
			const bb = new THREE.Box3();
			bb.setFromObject(gltf.scene);
			bb.getCenter(controls.target);
			controls.target.setY(controls.target.y - 10);
			camera.position.setZ(100);
			camera.position.setY(45);
			controls.update();

			pumpkin = gltf.scene.children[0];
			scene.add(pumpkin);
		});

		const light = new THREE.DirectionalLight(0xffffff, 0.9);
		light.position.set(1, 1, 1);
		scene.add(light);
		scene.add(new THREE.AmbientLight(0xffffff, 1));

		function render() {
			renderer.render(scene, camera);

			window.requestAnimationFrame(render);
		}

		window.requestAnimationFrame(render);
	});

	return (
		<>
			<div class="absolute flex w-full items-center justify-center gap-2 text-white">
				<div class="flex items-center gap-1">
					<label for="size">Size</label>
					<input
						id="size"
						ref={size_input}
						type="range"
						max={10}
						min={0}
						onChange={x => {
							setSize(x.target.value as unknown as number);
						}}></input>
					<span class="font-bold">{size()}</span>
				</div>

				<div class="flex items-center gap-1">
					<label for="strength">Strength</label>
					<input
						id="strength"
						ref={strength_input}
						type="range"
						max={100}
						min={-100}
						onChange={x => {
							setStrength(
								(x.target.value as unknown as number) / 100
							);
						}}></input>
					<span class="font-bold">{strength()}</span>
				</div>
			</div>

			<canvas ref={canvas}></canvas>
		</>
	);
}
