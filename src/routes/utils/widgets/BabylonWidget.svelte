<script lang="ts">
    import Change from '../dashboard/Change.svelte';
    import { Card, Heading } from 'flowbite-svelte';
    import LastRange from './LastRange.svelte';
    import More from './More.svelte';
    import { onMount } from 'svelte';
    import * as BABYLON from 'babylonjs';
    import * as GUI from 'babylonjs-gui';

    export let title: string = '';
    export let subtitle: string = '';

    let canvas: HTMLCanvasElement;
    let engine: BABYLON.Engine | null = null;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // BabylonPanel.js setup
    onMount(() => {
        // Create BabylonJS engine
        engine = new BABYLON.Engine(canvas, true);

        // Create scene
        const scene = new BABYLON.Scene(engine);

        // Create a fixed camera
        const camera1 = new BABYLON.ArcRotateCamera(
            "camera1",
            Math.PI / 4, // Angle around the Y-axis
            Math.PI / 4, // Angle above the ground
            15,          // Distance from the target
            new BABYLON.Vector3(0, 0, 0), // Target
            scene
        );
        camera1.attachControl(canvas, false); // Disable control (fixed view)

        // Create a light
        const light1 = new BABYLON.HemisphericLight(
            "light1",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );

        // Define scene size and model size
        const halfSceneSize = 5; // Scene boundary size (half the width/height)
        const modelSize = 2;     // Each model's size

        // Create 4 different models and place them in different areas of the scene
        const box1 = BABYLON.MeshBuilder.CreateBox("box1", { size: modelSize }, scene);
        box1.position = new BABYLON.Vector3(-halfSceneSize / 2, 0, -halfSceneSize / 2); // Top-left

        const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: modelSize }, scene);
        sphere2.position = new BABYLON.Vector3(halfSceneSize / 2, 0, -halfSceneSize / 2);  // Top-right

        const torus3 = BABYLON.MeshBuilder.CreateTorus("torus3", { diameter: modelSize, thickness: 0.5 }, scene);
        torus3.position = new BABYLON.Vector3(-halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-left

        const cylinder4 = BABYLON.MeshBuilder.CreateCylinder("cylinder4", { height: modelSize, diameter: 1 }, scene);
        cylinder4.position = new BABYLON.Vector3(halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-right

        // Add clipping planes to each model to restrict display area
        scene.onBeforeRenderObservable.add(() => {
            // Clipping planes for box1 (Top-left)
            box1.material = new BABYLON.StandardMaterial("box1Mat", scene);
            box1.material.clippingPlanes = [
                new BABYLON.Plane(1, 0, 0, halfSceneSize / 2),   // Right boundary
                new BABYLON.Plane(-1, 0, 0, halfSceneSize / 2),  // Left boundary
                new BABYLON.Plane(0, 0, 1, halfSceneSize / 2),   // Bottom boundary
                new BABYLON.Plane(0, 0, -1, halfSceneSize / 2),  // Top boundary
            ];

            // Clipping planes for sphere2 (Top-right)
            sphere2.material = new BABYLON.StandardMaterial("sphere2Mat", scene);
            sphere2.material.clippingPlanes = [
                new BABYLON.Plane(1, 0, 0, -halfSceneSize / 2),  // Right boundary
                new BABYLON.Plane(-1, 0, 0, -halfSceneSize / 2), // Left boundary
                new BABYLON.Plane(0, 0, 1, halfSceneSize / 2),   // Bottom boundary
                new BABYLON.Plane(0, 0, -1, halfSceneSize / 2),  // Top boundary
            ];

            // Clipping planes for torus3 (Bottom-left)
            torus3.material = new BABYLON.StandardMaterial("torus3Mat", scene);
            torus3.material.clippingPlanes = [
                new BABYLON.Plane(1, 0, 0, halfSceneSize / 2),   // Right boundary
                new BABYLON.Plane(-1, 0, 0, halfSceneSize / 2),  // Left boundary
                new BABYLON.Plane(0, 0, 1, -halfSceneSize / 2),  // Bottom boundary
                new BABYLON.Plane(0, 0, -1, -halfSceneSize / 2), // Top boundary
            ];

            // Clipping planes for cylinder4 (Bottom-right)
            cylinder4.material = new BABYLON.StandardMaterial("cylinder4Mat", scene);
            cylinder4.material.clippingPlanes = [
                new BABYLON.Plane(1, 0, 0, -halfSceneSize / 2),  // Right boundary
                new BABYLON.Plane(-1, 0, 0, -halfSceneSize / 2), // Left boundary
                new BABYLON.Plane(0, 0, 1, -halfSceneSize / 2),  // Bottom boundary
                new BABYLON.Plane(0, 0, -1, -halfSceneSize / 2), // Top boundary
            ];
        });

        // Render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Resize the scene if the window is resized
        window.addEventListener("resize", () => {
            if (engine) {
                engine.resize();
            }
        });

        // Clean up when the component unmounts
        return () => {
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

    <!-- BabylonPanel.js Canvas -->
    <canvas bind:this={canvas} class="w-full h-full"></canvas>

    <div
        class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700 sm:pt-6"
    >
        <LastRange />
        <More title="Sales Report" href="#top" />
    </div>
</Card>