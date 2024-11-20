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

    const IMAGE_URL = "images/board.jpg";
    const CAMERA_POSITION = new BABYLON.Vector3(0, 0, -10);
    const CAMERA_TARGET = BABYLON.Vector3.Zero();
    const FOV = Math.PI / 4; // 45 degrees

    /**
     * Initializes the Babylon.js scene, camera, light, and plane.
     */
    function initializeBabylon() {
        engine = new BABYLON.Engine(canvas, true);
        scene = new BABYLON.Scene(engine);

        // Setup Camera
        const camera = new BABYLON.UniversalCamera("camera", CAMERA_POSITION, scene);
        camera.setTarget(CAMERA_TARGET);
        camera.fov = FOV;

        // Add Hemispheric Light
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, -15), scene);

        // Optional: Add Axes for debugging
        new BABYLON.AxesViewer(scene, 2);

        // Load Texture and Create Plane
        const material = new BABYLON.StandardMaterial("boardMat", scene);
        const texture = new BABYLON.Texture(IMAGE_URL, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
            // On Texture Load
            imgAspectRatio = texture.getBaseSize().width / texture.getBaseSize().height;
            material.diffuseTexture = texture;
            material.specularColor = new BABYLON.Color3(0, 0, 0);
            material.backFaceCulling = false;

            createPlane();
        });

        // Render Loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Handle Resize
        window.addEventListener("resize", handleResize);
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
        const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
        const viewWidth = viewHeight * aspectRatio;

        // Desired plane size to occupy 1/4 of the canvas area
        let planeHeight = viewHeight / 2;
        let planeWidth = planeHeight * imgAspectRatio;

        // Adjust if width exceeds half the view width
        if (planeWidth > viewWidth / 2) {
            planeWidth = viewWidth / 2;
            planeHeight = planeWidth / imgAspectRatio;
        }

        boardPlane = BABYLON.MeshBuilder.CreatePlane("boardPlane", { width: planeWidth, height: planeHeight }, scene);
        boardPlane.material = scene.getMaterialByName("boardMat") as BABYLON.StandardMaterial;
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
        const aspectRatio = engine.getRenderWidth() / engine.getRenderHeight();
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

    onMount(() => {
        initializeBabylon();

        // Cleanup on unmount
        return () => {
            window.removeEventListener("resize", handleResize);
            if (engine) {
                engine.dispose();
            }
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
    <canvas bind:this={canvas} class="w-full h-full"></canvas>

    <div
        class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700 sm:pt-6"
    >
        <LastRange />
        <More title="Sales Report" href="#top" />
    </div>
</Card>