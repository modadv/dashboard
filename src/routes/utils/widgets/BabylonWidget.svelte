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
    let box: BABYLON.Mesh | null = null;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let scaleFactor = 1;

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
            5,           // Distance from the target
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

        // Create a simple box
        box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

        // Add mouse events to control box rotation and scaling
        canvas.addEventListener("mousedown", (event) => {
            isDragging = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });

        canvas.addEventListener("mousemove", (event) => {
            if (isDragging && box) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;

                // Rotate the box based on mouse movement
                box.rotation.y += deltaX * 0.01; // Horizontal drag rotates around Y-axis
                box.rotation.x += deltaY * 0.01; // Vertical drag rotates around X-axis

                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }
        });

        canvas.addEventListener("mouseup", () => {
            isDragging = false;
        });

        canvas.addEventListener("wheel", (event) => {
            if (box) {
                // Scale the box based on wheel movement
                scaleFactor += event.deltaY * -0.001; // Invert deltaY for natural zoom
                scaleFactor = Math.max(0.1, Math.min(5, scaleFactor)); // Clamp scale factor

                box.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
            }
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