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

    // BabylonPanel.js setup
    onMount(() => {
        // Create BabylonJS engine
        engine = new BABYLON.Engine(canvas, true);

        // Create scene
        const scene = new BABYLON.Scene(engine);

        // Create a camera for the 3D model (right top)
        const camera1 = new BABYLON.ArcRotateCamera(
            "camera1",
            Math.PI / 2,
            Math.PI / 2,
            2,
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        camera1.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5); // Right top quarter
        camera1.attachControl(canvas, true);

        // Create a light for the 3D model
        const light1 = new BABYLON.HemisphericLight(
            "light1",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );

        // Create a simple box for the 3D model
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1 }, scene);

        // Create cameras for other viewports (for images)
        const camera2 = new BABYLON.FreeCamera("camera2", new BABYLON.Vector3(0, 0, -10), scene);
        camera2.viewport = new BABYLON.Viewport(0, 0.5, 0.5, 0.5); // Left top quarter

        const camera3 = new BABYLON.FreeCamera("camera3", new BABYLON.Vector3(0, 0, -10), scene);
        camera3.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5); // Left bottom quarter

        const camera4 = new BABYLON.FreeCamera("camera4", new BABYLON.Vector3(0, 0, -10), scene);
        camera4.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5); // Right bottom quarter

        // Load images into the viewports
        function createImageOnViewport(camera, imageUrl) {
            const plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 2 }, scene);
            plane.position = new BABYLON.Vector3(0, 0, 0);

            const texture = GUI.AdvancedDynamicTexture.CreateForMesh(plane);
            const image = new GUI.Image("image", imageUrl);
            image.stretch = GUI.Image.STRETCH_UNIFORM;
            texture.addControl(image);

            camera.setTarget(BABYLON.Vector3.Zero());
        }

        // Add images to the viewports
        createImageOnViewport(camera2, "/path/to/image1.png");
        createImageOnViewport(camera3, "/path/to/image2.jpg");
        createImageOnViewport(camera4, "/path/to/image3.png");

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