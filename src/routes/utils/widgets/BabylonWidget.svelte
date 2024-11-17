<script lang="ts">
    import Change from '../dashboard/Change.svelte';
    import { Card, Heading } from 'flowbite-svelte';
    import LastRange from './LastRange.svelte';
    import More from './More.svelte';
    import { onMount } from 'svelte';
    import * as BABYLON from '@babylonjs/core';
    import * as BABYLON_GUI from '@babylonjs/gui';
    import '@babylonjs/loaders';

    export let title: string = '';
    export let subtitle: string = '';

    let canvas: HTMLCanvasElement;
    let engine: BABYLON.Engine | null = null;

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
        box1.position = new BABYLON.Vector3(0, 0, -halfSceneSize / 2); // Top-left
        box1.isPickable = true;

        let advancedTexture = BABYLON

        let materialPlane = new BABYLON.StandardMaterial("board2Mat", scene);
        materialPlane.diffuseTexture = new BABYLON.Texture("images/board.jpg", scene);
        materialPlane.specularColor = new BABYLON.Color3(0, 0, 0);
        materialPlane.backFaceCulling = false; // always show the front and the back of an element

        let boardPlane = BABYLON.Mesh.CreatePlane("boardPlane", 120, scene);
        boardPlane.position = new BABYLON.Vector3(halfSceneSize / 2, 0, -halfSceneSize / 2);  // Top-right
        boardPlane.rotation.x = Math.PI / 2;
        boardPlane.material = materialPlane;
        boardPlane.isPickable = true;

        // const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", { diameter: modelSize }, scene);
        // sphere2.position = new BABYLON.Vector3(halfSceneSize / 2, 0, -halfSceneSize / 2);  // Top-right
        // sphere2.isPickable = true;

        const torus3 = BABYLON.MeshBuilder.CreateTorus("torus3", { diameter: modelSize, thickness: 0.5 }, scene);
        torus3.position = new BABYLON.Vector3(-halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-left
        torus3.isPickable = true;

        const cylinder4 = BABYLON.MeshBuilder.CreateCylinder("cylinder4", { height: modelSize, diameter: 1 }, scene);
        cylinder4.position = new BABYLON.Vector3(halfSceneSize / 2, 0, halfSceneSize / 2);  // Bottom-right
        cylinder4.isPickable = true;

        let rotating = false;
        const rightDir = new BABYLON.Vector3();
        const upDir = new BABYLON.Vector3();
        const sensitivity = 0.005;
        let selectedMesh: BABYLON.Mesh|null;
        let scaleFactor = 1;

        scene.onPointerObservable.add((pointerInfo: BABYLON.PointerInfo) => {
            if (pointerInfo.pickInfo) {
                pointerInfo.event.preventDefault(); // Prevent scrolling the page
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERDOWN:
                        if (pointerInfo.pickInfo.pickedMesh) {
                            if (pointerInfo.type === 1) {
                                selectedMesh = pointerInfo.pickInfo.pickedMesh as BABYLON.Mesh;
                                rotating = true;
                            }
                        }
                        break;

                    case BABYLON.PointerEventTypes.POINTERUP:
                        if (rotating) {
                            rotating = false;
                            selectedMesh = null;
                        }
                        break;

                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        if (rotating && selectedMesh && selectedMesh === box1) {
                            const matrix = camera.getWorldMatrix();
                            rightDir.copyFromFloats(matrix.m[0], matrix.m[1], matrix.m[2]);
                            upDir.copyFromFloats(matrix.m[4], matrix.m[5], matrix.m[6]);

                            selectedMesh.rotateAround(selectedMesh.position, rightDir, pointerInfo.event.movementY * -1 * sensitivity);
                            selectedMesh.rotateAround(selectedMesh.position, upDir, pointerInfo.event.movementX * -1 * sensitivity);
                        }
                        break;

                    case BABYLON.PointerEventTypes.POINTERWHEEL:
                        const pickResult = scene.pick(scene.pointerX, scene.pointerY);
                        if (pickResult.hit && pickResult.pickedMesh) {
                            let hoveredMesh = pickResult.pickedMesh;
                            if (hoveredMesh) {
                                const wheelEvent: WheelEvent = pointerInfo.event as WheelEvent;
                                // Scale the selected mesh based on wheel movement
                                scaleFactor += wheelEvent.deltaY * -0.001; // Invert deltaY for natural zoom
                                scaleFactor = Math.max(0.1, Math.min(2, scaleFactor)); // Clamp scale factor

                                hoveredMesh.scaling = new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor);
                            }
                        }
                        break;
                }
            }
        });

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

        // const materialPlane = new BABYLON.StandardMaterial("sphere2Mat", scene);
        materialPlane.clippingPlanes = [
            new BABYLON.Plane(1, 0, 0, -halfSceneSize / 2),  // Right boundary
            new BABYLON.Plane(-1, 0, 0, -halfSceneSize / 2), // Left boundary
            new BABYLON.Plane(0, 0, 1, halfSceneSize / 2),   // Bottom boundary
            new BABYLON.Plane(0, 0, -1, halfSceneSize / 2),  // Top boundary
        ];
        boardPlane.material = materialPlane;

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