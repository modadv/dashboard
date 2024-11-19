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
    let engine: BABYLON.Engine | null = null;
    let boardPlane: BABYLON.Mesh | null = null; // Reference to the Plane
    let initialPlaneWidth: number = 0;
    let initialPlaneHeight: number = 0;
    let imgAspectRatio: number = 1;

    // Babylon setup
    onMount(() => {
        engine = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(engine);

        // Create a Universal Camera
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 20, 0), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.fov = Math.PI / 4; // 45 degrees field of view
        camera.attachControl(canvas, true);

        // Add a Hemispheric Light
        const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene );

        // Create Material with Texture
        const materialPlane = new BABYLON.StandardMaterial("board2Mat", scene);
        const texture = new BABYLON.Texture("images/board.jpg", scene);
        materialPlane.diffuseTexture = texture;
        materialPlane.specularColor = new BABYLON.Color3(0, 0, 0);
        materialPlane.backFaceCulling = false;

        // Load the image to get its aspect ratio
        const img = new Image();
        img.src = "images/board.jpg";
        img.onload = () => {
            imgAspectRatio = img.width / img.height;

            // Calculate camera parameters
            const distance = BABYLON.Vector3.Distance(camera.position, new BABYLON.Vector3(0, 0, 0));
            const fov = camera.fov; // Vertical FOV

            // Calculate the height of the view at the Plane's distance
            const viewHeight = 2 * distance * Math.tan(fov / 2);
            const engineWidth = engine.getRenderingCanvasClientRect().width;
            const engineHeight = engine.getRenderingCanvasClientRect().height;
            const aspectRatio = engineWidth / engineHeight;
            const viewWidth = viewHeight * aspectRatio;

            // To occupy 1/4 of the canvas area, set Plane size to half the view dimensions
            let planeHeight = viewHeight / 2;
            let planeWidth = planeHeight * imgAspectRatio;

            // Adjust Plane size based on aspect ratio
            if (planeWidth > viewWidth / 2) {
                planeWidth = viewWidth / 2;
                planeHeight = planeWidth / imgAspectRatio;
            }

            initialPlaneWidth = planeWidth;
            initialPlaneHeight = planeHeight;

            // Create the Plane with calculated dimensions
            boardPlane = BABYLON.MeshBuilder.CreatePlane("boardPlane", {
                width: planeWidth,
                height: planeHeight
            }, scene);

            boardPlane.position = new BABYLON.Vector3(0, 0, 0);  // Center of the scene
            boardPlane.rotation.x = Math.PI / 2;  // Rotate to lie horizontally
            boardPlane.material = materialPlane;
            boardPlane.isPickable = true;
        };

        // Render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Resize the scene if the window is resized
        const resizeListener = () => {
            if (engine && boardPlane) {
                engine.resize();

                // Recalculate view dimensions
                const distance = BABYLON.Vector3.Distance(camera.position, new BABYLON.Vector3(0, 0, 0));
                const fov = camera.fov;
                const viewHeight = 2 * distance * Math.tan(fov / 2);
                const engineWidth = engine.getRenderingCanvasClientRect().width;
                const engineHeight = engine.getRenderingCanvasClientRect().height;
                const aspectRatio = engineWidth / engineHeight;
                const viewWidth = viewHeight * aspectRatio;

                // Recalculate Plane size
                let newPlaneHeight = viewHeight / 2;
                let newPlaneWidth = newPlaneHeight * imgAspectRatio;

                // Adjust based on aspect ratio
                if (newPlaneWidth > viewWidth / 2) {
                    newPlaneWidth = viewWidth / 2;
                    newPlaneHeight = newPlaneWidth / imgAspectRatio;
                }

                // Update Plane scaling
                const scaleX = newPlaneWidth / initialPlaneWidth;
                const scaleY = newPlaneHeight / initialPlaneHeight;

                boardPlane.scaling.x = scaleX;
                boardPlane.scaling.y = scaleY;
            }
        };

        window.addEventListener("resize", resizeListener);

        // Clean up when the component unmounts
        return () => {
            window.removeEventListener("resize", resizeListener);
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