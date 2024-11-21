<script lang="ts">
	import Change from '../dashboard/Change.svelte';
	import { Card, Heading } from 'flowbite-svelte';
	import LastRange from './LastRange.svelte';
	import More from './More.svelte';
	import { onMount } from 'svelte';
	import * as BABYLON from '@babylonjs/core';
	import '@babylonjs/loaders';
  
	export let title: string = '';
	export let subtitle: string = '';
  
	let canvas: HTMLCanvasElement;
	let engine: BABYLON.Engine;
	let scene: BABYLON.Scene;
	let boardPlane: BABYLON.Mesh;
	let imgAspectRatio: number = 1;
  
	const IMAGE_URL = 'images/board.jpg';
	const CAMERA_POSITION = new BABYLON.Vector3(0, 0, -10);
	const CAMERA_TARGET = BABYLON.Vector3.Zero();
	const FOV = Math.PI / 4; // 45 degrees
  
	// Variables for dragging
	let isDragging = false;
	let previousPointerPosition: BABYLON.Vector2;
	let initialPlanePosition: BABYLON.Vector3;
  
	// Variables for zoom limits
	const MIN_SCALE = 0.01;
	const MAX_SCALE = 50.0;
  
	/**
	 * Initializes the Babylon.js scene, camera, light, and plane.
	 */
	function initBabylon() {
	  engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
	  scene = new BABYLON.Scene(engine);
  
	  // Setup Camera
	  const camera = new BABYLON.UniversalCamera('camera', CAMERA_POSITION, scene);
	  camera.setTarget(CAMERA_TARGET);
	  camera.fov = FOV;
	  camera.maxZ = 1000;
  
	  // Ensure the camera remains fixed by not attaching any controls
	  // Remove or comment out the following line if present
	  // camera.attachControl(canvas, true);
  
	  // Add Hemispheric Light
	  const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, -15), scene);
	  light.intensity = 0.7;
  
	  // Optional: Add Axes for debugging
	  // new BABYLON.AxesViewer(scene, 3);
  
	  // Load Texture and Create Plane
	  const material = new BABYLON.StandardMaterial('boardMat', scene);
	  const texture = new BABYLON.Texture(
		IMAGE_URL,
		scene,
		false,
		false,
		BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
		() => {
		  // On Texture Load
		  imgAspectRatio = texture.getBaseSize().width / texture.getBaseSize().height;
		  material.diffuseTexture = texture;
		  material.specularColor = new BABYLON.Color3(0, 0, 0);
		  material.backFaceCulling = false;
  
		  createPlane();
		}
	  );
  
	  // Render Loop
	  engine.runRenderLoop(() => {
		scene.render();
	  });
  
	  // Handle Resize
	  window.addEventListener('resize', handleResize);
  
	  // Add Pointer Events for Dragging
	  canvas.addEventListener('pointerdown', onPointerDown);
	  canvas.addEventListener('pointermove', onPointerMove);
	  canvas.addEventListener('pointerup', onPointerUp);
	  canvas.addEventListener('pointerout', onPointerUp); // Handle pointer leaving the canvas
  
	  // Add Wheel Event for Zooming
	  canvas.addEventListener('wheel', onMouseWheel, { passive: false });
	}
  
	/**
	 * Creates the plane mesh with appropriate scaling and positioning.
	 */
	function createPlane() {
	  const camera = scene.activeCamera as BABYLON.UniversalCamera;
	  if (!camera) return;
  
	  // Calculate view dimensions at the plane's Z position
	  const distance = Math.abs(camera.position.z - CAMERA_TARGET.z);
	  const viewHeight = 2 * distance * Math.tan(camera.fov / 2);
	  const aspectRatio = engine.getAspectRatio(camera) || (engine.getRenderWidth() / engine.getRenderHeight());
	  const viewWidth = viewHeight * aspectRatio;
  
	  // Desired plane size to occupy 1/4 of the canvas area
	  let planeHeight = viewHeight / 2;
	  let planeWidth = planeHeight * imgAspectRatio;
  
	  // Adjust if width exceeds half the view width
	  if (planeWidth > viewWidth / 2) {
		planeWidth = viewWidth / 2;
		planeHeight = planeWidth / imgAspectRatio;
	  }
  
	  boardPlane = BABYLON.MeshBuilder.CreatePlane(
		'boardPlane',
		{ width: planeWidth, height: planeHeight },
		scene
	  );
	  boardPlane.material = scene.getMaterialByName('boardMat') as BABYLON.StandardMaterial;
	  boardPlane.isPickable = true;
	  boardPlane.position = new BABYLON.Vector3(-viewWidth / 4, viewHeight / 4, 0);
	  // No rotation needed; plane lies in XY plane facing positive Z
	}
  
	/**
	 * Handles window resize to adjust camera and plane accordingly.
	 */
	function handleResize() {
	  engine.resize();
  
	  if (!boardPlane) return;
  
	  const camera = scene.activeCamera as BABYLON.UniversalCamera;
	  if (!camera) return;
  
	  // Recalculate view dimensions
	  const distance = Math.abs(camera.position.z - CAMERA_TARGET.z);
	  const viewHeight = 2 * distance * Math.tan(camera.fov / 2);
	  const aspectRatio = engine.getAspectRatio(camera) || (engine.getRenderWidth() / engine.getRenderHeight());
	  const viewWidth = viewHeight * aspectRatio;
  
	  // Recalculate Plane size
	  let planeHeight = viewHeight / 2;
	  let planeWidth = planeHeight * imgAspectRatio;
  
	  if (planeWidth > viewWidth / 2) {
		planeWidth = viewWidth / 2;
		planeHeight = planeWidth / imgAspectRatio;
	  }
  
	  // Update Plane scaling
	  boardPlane.scaling.x = planeWidth / boardPlane.scaling.x;
	  boardPlane.scaling.y = planeHeight / boardPlane.scaling.y;
  
	  // Update Plane position
	  boardPlane.position.set(-viewWidth / 4, viewHeight / 4, 0);
	}
  
	/**
	 * Pointer Down Event Handler
	 */
	function onPointerDown(event: PointerEvent) {
	  if (event.button !== 0) return; // Only left mouse button
  
	  // Get canvas bounds
	  const rect = canvas.getBoundingClientRect();
  
	  // Calculate normalized device coordinates
	  const pickInfo = scene.pick(
		(event.clientX - rect.left) / rect.width * engine.getRenderWidth(),
		(event.clientY - rect.top) / rect.height * engine.getRenderHeight()
	  );
  
	  if (pickInfo?.hit && pickInfo.pickedMesh === boardPlane) {
		isDragging = true;
		previousPointerPosition = new BABYLON.Vector2(event.clientX, event.clientY);
		initialPlanePosition = boardPlane.position.clone();
		// Change cursor to grabbing
		canvas.style.cursor = 'grabbing';
	  }
	}
  
	/**
	 * Pointer Move Event Handler
	 */
	function onPointerMove(event: PointerEvent) {
	  if (!isDragging) return;
  
	  const deltaX = event.clientX - previousPointerPosition.x;
	  const deltaY = event.clientY - previousPointerPosition.y;
  
	  previousPointerPosition = new BABYLON.Vector2(event.clientX, event.clientY);
  
	  const camera = scene.activeCamera as BABYLON.UniversalCamera;
	  if (!camera) return;
  
	  // Convert screen delta to world delta
	  const sceneWidth = engine.getRenderWidth();
	  const sceneHeight = engine.getRenderHeight();
  
	  const distance = Math.abs(camera.position.z - CAMERA_TARGET.z);
	  const viewHeight = 2 * distance * Math.tan(camera.fov / 2);
	  const aspectRatio = engine.getAspectRatio(camera) || (engine.getRenderWidth() / engine.getRenderHeight());
	  const viewWidth = viewHeight * aspectRatio;
  
	  const worldDeltaX = (deltaX / sceneWidth) * viewWidth;
	  const worldDeltaY = (-deltaY / sceneHeight) * viewHeight; // Invert Y
  
	  boardPlane.position = new BABYLON.Vector3(
		boardPlane.position.x + worldDeltaX,
		boardPlane.position.y + worldDeltaY,
		boardPlane.position.z
	  );
	}
  
	/**
	 * Pointer Up Event Handler
	 */
	function onPointerUp(event: PointerEvent) {
	  if (event.button !== 0) return; // Only left mouse button
	  if (isDragging) {
		isDragging = false;
		// Revert cursor to default
		canvas.style.cursor = 'default';
	  }
	}
  
	/**
	 * Mouse Wheel Event Handler for Zooming
	 */
	function onMouseWheel(event: WheelEvent) {
	  event.preventDefault();
  
	  const delta = Math.sign(event.deltaY);
	  const zoomFactor = 1.05;
  
	  let scale = boardPlane.scaling.x;
  
	  if (delta < 0) {
		// Zoom In
		scale /= zoomFactor;
	  } else {
		// Zoom Out
		scale *= zoomFactor;
	  }
  
	  // Clamp the scale
	  scale = BABYLON.Scalar.Clamp(scale, MIN_SCALE, MAX_SCALE);
  
	  boardPlane.scaling = new BABYLON.Vector3(scale, scale, 1);
	}
  
	onMount(() => {
	  initBabylon();
  
	  // Set initial cursor
	  canvas.style.cursor = 'default';
  
	  // Cursor feedback for hover
	  const onHover = (event: PointerEvent) => {
		const rect = canvas.getBoundingClientRect();
		const pickInfo = scene.pick(
		  (event.clientX - rect.left) / rect.width * engine.getRenderWidth(),
		  (event.clientY - rect.top) / rect.height * engine.getRenderHeight()
		);
  
		if (pickInfo?.hit && pickInfo.pickedMesh === boardPlane) {
		  canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
		} else {
		  canvas.style.cursor = 'default';
		}
	  };
  
	  canvas.addEventListener('pointermove', onHover);
  
	  // Cleanup on unmount
	  return () => {
		window.removeEventListener('resize', handleResize);
		if (engine) {
		  engine.dispose();
		}
  
		// Remove additional event listeners
		canvas.removeEventListener('pointerdown', onPointerDown);
		canvas.removeEventListener('pointermove', onPointerMove);
		canvas.removeEventListener('pointerup', onPointerUp);
		canvas.removeEventListener('pointerout', onPointerUp);
		canvas.removeEventListener('wheel', onMouseWheel);
		canvas.removeEventListener('pointermove', onHover);
	  };
	});
  </script>
  
  <Card size="xl" class="w-full max-w-none 2xl:col-span-2">
	<div class="mb-4 flex items-center justify-between">
	  <div class="flex-shrink-0">
		<Heading tag="h3" class="text-2xl">{title}</Heading>
		<p class="text-base font-light text-gray-500 dark:text-gray-400">
		  {subtitle}
		</p>
	  </div>
	  <Change value={12.5} since="" class="justify-end font-medium" />
	</div>
  
	<!-- Babylon.js Canvas -->
	<canvas bind:this={canvas} class="h-full w-full"></canvas>
  
	<div
	  class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 sm:pt-6 dark:border-gray-700"
	>
	  <LastRange />
	  <More title="Sales Report" href="#top" />
	</div>
  </Card>