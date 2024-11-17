<script lang="ts">
    import Change from '../dashboard/Change.svelte';
    import { Card, Heading } from 'flowbite-svelte';
    import LastRange from './LastRange.svelte';
    import More from './More.svelte';
    import { onMount } from 'svelte';
    import * as BABYLON from 'babylonjs';

    export let title: string = '';
    export let subtitle: string = '';

    let canvas: HTMLCanvasElement;
    let engine: BABYLON.Engine | null = null;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let selectedMesh: BABYLON.Mesh | null = null;
    let scaleFactor = 1;

    // Babylon setup
    onMount(() => {
        // Create BabylonJS engine
        engine = new BABYLON.Engine(canvas, true);

        // Create scene
        const scene = new BABYLON.Scene(engine);

        // Create a fixed UniversalCamera
        const camera = new BABYLON.UniversalCamera(
            "camera",
            new BABYLON.Vector3(0, 20, 0), // Camera position
            scene
        );
        camera.setTarget(BABYLON.Vector3.Zero()); // Look at the center of the scene

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
        box1.isPickable = true;

        let rotating = false;
        const rightDir = new BABYLON.Vector3();
        const upDir = new BABYLON.Vector3();
        const sensitivity = 0.005;
        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.pickInfo) {
                if (pointerInfo.type === 1) {
                    if (pointerInfo.pickInfo.pickedMesh === box1) {
                        if (pointerInfo.type === 1) {
                            rotating = true;
                        }
                    }
                } else if (pointerInfo.type === 2 && rotating) {
                    rotating = false;
                } else if (pointerInfo.type === 4 && rotating) {
                    const matrix = camera.getWorldMatrix();
                    rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
                    upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);

                    box1.rotateAround(box1.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
                    box1.rotateAround(box1.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
                }
            }
        });

        box1.position = new BABYLON.Vector3(-halfSceneSize / 2, 0, -halfSceneSize / 2); // Top-left

        const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: modelSize }, scene);
        sphere2.position = new BABYLON.Vector3(halfSceneSize / 2, 0, -halfSceneSize / 2);  // Top-right

        const torus3 = BABYLON.MeshBuilder.CreateTorus("torus3", { diameter: modelSize, thickness: 0.5 }, scene);
        torus3.position = new BABYLON.Vector3(-halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-left

        const cylinder4 = BABYLON.MeshBuilder.CreateCylinder("cylinder4", { height: modelSize, diameter: 1 }, scene);
        cylinder4.position = new BABYLON.Vector3(halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-right

        // Add clipping planes to each model to restrict display area
        // 初始化材质和裁剪平面
        const box1Material = new BABYLON.StandardMaterial("box1Mat", scene);
        box1Material.clippingPlanes = [
            new BABYLON.Plane(1, 0, 0, halfSceneSize / 2),   // Right boundary
            new BABYLON.Plane(-1, 0, 0, halfSceneSize / 2),  // Left boundary
            new BABYLON.Plane(0, 0, 1, halfSceneSize / 2),   // Bottom boundary
            new BABYLON.Plane(0, 0, -1, halfSceneSize / 2),  // Top boundary
        ];
        box1.material = box1Material;

        const sphere2Material = new BABYLON.StandardMaterial("sphere2Mat", scene);
        sphere2Material.clippingPlanes = [
            new BABYLON.Plane(1, 0, 0, -halfSceneSize / 2),  // Right boundary
            new BABYLON.Plane(-1, 0, 0, -halfSceneSize / 2), // Left boundary
            new BABYLON.Plane(0, 0, 1, halfSceneSize / 2),   // Bottom boundary
            new BABYLON.Plane(0, 0, -1, halfSceneSize / 2),  // Top boundary
        ];
        sphere2.material = sphere2Material;

        const torus3Material = new BABYLON.StandardMaterial("torus3Mat", scene);
        torus3Material.clippingPlanes = [
            new BABYLON.Plane(1, 0, 0, halfSceneSize / 2),   // Right boundary
            new BABYLON.Plane(-1, 0, 0, halfSceneSize / 2),  // Left boundary
            new BABYLON.Plane(0, 0, 1, -halfSceneSize / 2),  // Bottom boundary
            new BABYLON.Plane(0, 0, -1, -halfSceneSize / 2), // Top boundary
        ];
        torus3.material = torus3Material;

        const cylinder4Material = new BABYLON.StandardMaterial("cylinder4Mat", scene);
        cylinder4Material.clippingPlanes = [
            new BABYLON.Plane(1, 0, 0, -halfSceneSize / 2),  // Right boundary
            new BABYLON.Plane(-1, 0, 0, -halfSceneSize / 2), // Left boundary
            new BABYLON.Plane(0, 0, 1, -halfSceneSize / 2),  // Bottom boundary
            new BABYLON.Plane(0, 0, -1, -halfSceneSize / 2), // Top boundary
        ];
        cylinder4.material = cylinder4Material;

        // 如果你需要在每一帧做其他逻辑操作，可以继续使用 onBeforeRenderObservable
        scene.onBeforeRenderObservable.add(() => {
            // 在这里执行需要在每一帧做的其他操作
        });

        // Mouse event handling for object interaction (rotation and scaling)
        canvas.addEventListener("mousedown", (event) => {
            isDragging = true;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            // Perform a pick to detect which mesh is clicked
            const pickResult = scene.pick(event.clientX, event.clientY);
            if (pickResult && pickResult.hit) {
                selectedMesh = pickResult.pickedMesh as BABYLON.Mesh;
            }
        });

        canvas.addEventListener("mousemove", (event) => {
            if (isDragging && selectedMesh) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;

                // Rotate the selected mesh based on mouse movement
                selectedMesh.rotation.y += deltaX * 0.01; // Horizontal drag rotates around Y-axis
                selectedMesh.rotation.x += deltaY * 0.01; // Vertical drag rotates around X-axis

                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }
        });

        canvas.addEventListener("mouseup", () => {
            isDragging = false;
            selectedMesh = null;
        });

        canvas.addEventListener("wheel", (event) => {
            event.preventDefault(); // Prevent scrolling the page
            const pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit && pickResult.pickedMesh) {
                let hoveredMesh = pickResult.pickedMesh;
                if (hoveredMesh) {
                    // Scale the selected mesh based on wheel movement
                    scaleFactor += event.deltaY * -0.001; // Invert deltaY for natural zoom
                    scaleFactor = Math.max(0.1, Math.min(5, scaleFactor)); // Clamp scale factor

                    hoveredMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
                }
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