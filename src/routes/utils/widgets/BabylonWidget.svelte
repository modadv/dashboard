<script lang="ts">
	import Change from '../dashboard/Change.svelte';
	import { Card, Heading } from 'flowbite-svelte';
	import LastRange from './LastRange.svelte';
	import More from './More.svelte';
	import { onMount } from 'svelte';
	import * as BABYLON from '@babylonjs/core';
	import '@babylonjs/loaders';

    let title: string = "Board View";
    let subtitle: string = "Board View";

	let canvas: HTMLCanvasElement;

	let engine: BABYLON.Engine;
	let scene: BABYLON.Scene;
	let sceneToRender: BABYLON.Scene;

    const CAMERAQUAD4_POSITION = new BABYLON.Vector3(0.5, -0.5, -10);
    const CAMERAQUAD4_TARGET = new BABYLON.Vector3(0.5, -0.5, 0);
    
    const CAMERAQUAD3_POSITION = new BABYLON.Vector3(-0.5, -0.5, -10);
    const CAMERAQUAD3_TARGET = new BABYLON.Vector3(-0.5, -0.5, 0);
    

    const CAMERAQUAD2_POSITION = new BABYLON.Vector3(0.5, -0.5, -10);
    const CAMERAQUAD2_TARGET = new BABYLON.Vector3(0.5, -0.5, 0);
    

    const CAMERAQUAD1_POSITION = new BABYLON.Vector3(0.5, -0.5, -10);
    const CAMERAQUAD1_TARGET = new BABYLON.Vector3(0.5, -0.5, 0);

    const FOV = Math.PI / 4; // 45 degrees

    const LAYER_MASK_3D = 0x00000001;
    const LAYER_MASK_2 = 0x00000010;
    const LAYER_MASK_3 = 0x00000100;
    const LAYER_MASK_4 = 0x00001000;
	onMount(() => {
		function startRenderLoop(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
			engine.runRenderLoop(function () {
				if (sceneToRender && sceneToRender.activeCamera) {
					sceneToRender.render();
				}
			});
		};

		function createDefaultEngine() {
			return new BABYLON.Engine(canvas, true, {
				preserveDrawingBuffer: true,
				stencil: true,
				disableWebGL2Support: false
			});
		};

		function createScene() {
			let scene = new BABYLON.Scene(engine);
			scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);
			let camera3d = new BABYLON.ArcRotateCamera(
				'cameraQuad3',
				(5 * Math.PI) / 8,
				(5 * Math.PI) / 8,
				30,
				new BABYLON.Vector3(0, 2, 0),
				scene
			);
			camera3d.attachControl(canvas, true);
			camera3d.viewport = new BABYLON.Viewport(0.5, 0.5, 0.5, 0.5);
            camera3d.layerMask = LAYER_MASK_3D;
			scene?.activeCameras?.push(camera3d);

            const cameraQuad2 = new BABYLON.UniversalCamera('cameraQuad2', CAMERAQUAD3_POSITION, scene);
            cameraQuad2.setTarget(CAMERAQUAD3_TARGET);
            cameraQuad2.fov = FOV;
            cameraQuad2.maxZ = 1000;

			cameraQuad2.viewport = new BABYLON.Viewport(0, 0.5, 0.5, 0.5);
            cameraQuad2.layerMask = LAYER_MASK_2;
			scene?.activeCameras?.push(cameraQuad2);

            const plane2 = BABYLON.MeshBuilder.CreatePlane("plane2", { size: 40 }, scene);
            const material2 = new BABYLON.StandardMaterial("plane2Material", scene);
            material2.diffuseTexture = new BABYLON.Texture("results/T_20241019112555250_1_NG/0/0_COMP1633_1633.png", scene);
            (material2.diffuseTexture as BABYLON.Texture).onLoadObservable.add(() => {
                if (material2.diffuseTexture) {
                    const imgWidth = material2.diffuseTexture.getSize().width;
                    const imgHeight = material2.diffuseTexture.getSize().height;

                    // 计算图片宽高比
                    const aspectRatio = imgWidth / imgHeight;

                    // 调整平面比例
                    plane2.scaling.x = aspectRatio * 0.2; // 宽度
                    plane2.scaling.y = 1 * 0.2;           // 高度
                }
            });

            material2.backFaceCulling = false;
            material2.twoSidedLighting = true;

            plane2.material = material2;
            plane2.layerMask = LAYER_MASK_2;

            ////////////////////////////////////////////////////////////////////////////////////////////////

            const cameraQuad3 = new BABYLON.UniversalCamera('cameraQuad3', CAMERAQUAD3_POSITION, scene);
            cameraQuad3.setTarget(CAMERAQUAD3_TARGET);
            cameraQuad3.fov = FOV;
            cameraQuad3.maxZ = 1000;

			cameraQuad3.viewport = new BABYLON.Viewport(0, 0, 0.5, 0.5);
            cameraQuad3.layerMask = LAYER_MASK_3;
			scene?.activeCameras?.push(cameraQuad3);
            
            const plane3 = BABYLON.MeshBuilder.CreatePlane("plane3", { size: 40 }, scene);
            const material3 = new BABYLON.StandardMaterial("plane3Material", scene);
            material3.diffuseTexture = new BABYLON.Texture("results/T_20241019112555250_1_NG/0/1635_0_20241018163719.jpg", scene);
            (material3.diffuseTexture as BABYLON.Texture).onLoadObservable.add(() => {
                if (material3.diffuseTexture) {
                    const imgWidth = material3.diffuseTexture.getSize().width;
                    const imgHeight = material3.diffuseTexture.getSize().height;

                    // 计算图片宽高比
                    const aspectRatio = imgWidth / imgHeight;

                    // 调整平面比例
                    plane3.scaling.x = aspectRatio * 0.2; // 宽度
                    plane3.scaling.y = 1 * 0.2;           // 高度
                }
            });

            material3.backFaceCulling = false;
            material3.twoSidedLighting = true;

            plane3.material = material3;
            plane3.layerMask = LAYER_MASK_3;

            const cameraQuad4 = new BABYLON.UniversalCamera('cameraQuad4', CAMERAQUAD4_POSITION, scene);
            cameraQuad4.setTarget(CAMERAQUAD4_TARGET);
            cameraQuad4.fov = FOV;
            cameraQuad4.maxZ = 1000;
            
			cameraQuad4.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 0.5);
            cameraQuad4.layerMask = LAYER_MASK_4;
			scene?.activeCameras?.push(cameraQuad4);

            const plane4 = BABYLON.MeshBuilder.CreatePlane("plane4", { size: 40 }, scene);
            const material4 = new BABYLON.StandardMaterial("plane4Material", scene);
            material4.diffuseTexture = new BABYLON.Texture("results/T_20241019112555250_1_NG/0/0_COMP1390_1390.png", scene);
            (material4.diffuseTexture as BABYLON.Texture).onLoadObservable.add(() => {
                if (material4.diffuseTexture) {
                    const imgWidth = material4.diffuseTexture.getSize().width;
                    const imgHeight = material4.diffuseTexture.getSize().height;

                    // 计算图片宽高比
                    const aspectRatio = imgWidth / imgHeight;

                    // 调整平面比例
                    plane4.scaling.x = aspectRatio * 0.2; // 宽度
                    plane4.scaling.y = 1 * 0.2;           // 高度
                }
            });
            material4.backFaceCulling = false;
            material4.twoSidedLighting = true;

            plane4.material = material4;
            plane4.layerMask = LAYER_MASK_4;

			// lights
			let light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 0.5, 0), scene);
			light1.intensity = 0.7;
			let light2 = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(-1, -0.5, 0), scene);
			light2.intensity = 0.8;

			/*********************Create Box***************/
			// let faceColors: Array<BABYLON.Color4> = [];
            // faceColors[0] = BABYLON.Color4.FromColor3(BABYLON.Color3.Blue());
            // faceColors[1] = BABYLON.Color4.FromColor3(BABYLON.Color3.White());
            // faceColors[2] = BABYLON.Color4.FromColor3(BABYLON.Color3.Red());
            // faceColors[3] = BABYLON.Color4.FromColor3(BABYLON.Color3.Black());
            // faceColors[4] = BABYLON.Color4.FromColor3(BABYLON.Color3.Green());
            // faceColors[5] = BABYLON.Color4.FromColor3(BABYLON.Color3.Yellow());
            
			// let box = BABYLON.MeshBuilder.CreateBox(
			// 	'Box',
			// 	{ faceColors: faceColors, size: 2 },
			// 	scene
			// );
			// box.material = new BABYLON.StandardMaterial('', scene);
            // box.layerMask = LAYER_MASK_3D;
			/*******************End Box Creation*****************************************/

            /*****************Create Height Map Ground**************/
                // Ground
            var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
            groundMaterial.diffuseTexture = new BABYLON.Texture("textures/earth.jpg", scene);

            var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/worldHeightMap.jpg", 200, 200, 250, 0, 40, scene, false, function () {
                ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.HeightmapImpostor, { mass: 0 });
                scene.onPointerUp = function () {
                    scene.meshes.forEach(function (m) {
                        if (m.name == "s") {
                            m.applyImpulse(new BABYLON.Vector3(Math.random(), 0, Math.random()).scale((Math.random() < 0.5) ? -15 : 15), m.getAbsolutePosition());
                        }
                    })
                }

                scene.registerBeforeRender(function () {
                    scene.meshes.forEach(function (m) {
                        if (m.name=="s" && m.position.y < 0) {
                            m.dispose();
                        }
                    })
                });
            });
            ground.material = groundMaterial;
            ground.layerMask = LAYER_MASK_3D;
            /*****************End Create Height Map Ground**********/

			/***********Create and Draw Axes**************************************/
			function showAxis(size: number) {
				function makeTextPlane(text: string, color: string, size: number) {
					let dynamicTexture = new BABYLON.DynamicTexture('DynamicTexture', 50, scene, true);
					dynamicTexture.hasAlpha = true;
					dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
					let plane = BABYLON.MeshBuilder.CreatePlane('TextPlane', {size}, scene);
					plane.material = new BABYLON.StandardMaterial('TextPlaneMaterial', scene);
					(plane.material as BABYLON.StandardMaterial).backFaceCulling = false;
					(plane.material as BABYLON.StandardMaterial).specularColor = new BABYLON.Color3(0, 0, 0);
					(plane.material as BABYLON.StandardMaterial).diffuseTexture = dynamicTexture;
					return plane;
				};

				let axisX = BABYLON.MeshBuilder.CreateLines(
					'axisX',
					{
                        points: [
                            BABYLON.Vector3.Zero(),
                            new BABYLON.Vector3(size, 0, 0),
                            new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                            new BABYLON.Vector3(size, 0, 0),
                            new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
                        ]
                    },
					scene
				);
				axisX.color = new BABYLON.Color3(1, 0, 0);
				let xChar = makeTextPlane('X', 'red', size / 10);
				xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
				
                let axisY = BABYLON.MeshBuilder.CreateLines(
                    "axisY",
                    {
                        points: [
                            BABYLON.Vector3.Zero(),
                            new BABYLON.Vector3(0, size, 0),
                            new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                            new BABYLON.Vector3(0, size, 0),
                            new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
                        ], // 定义线段的点列表
                        updatable: false // 是否允许更新
                    },
                    scene // 场景
                );

				axisY.color = new BABYLON.Color3(0, 1, 0);
				let yChar = makeTextPlane('Y', 'green', size / 10);
				yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

				let axisZ = BABYLON.MeshBuilder.CreateLines(
					'axisZ',
					{
                        points: [
                            BABYLON.Vector3.Zero(),
                            new BABYLON.Vector3(0, 0, size),
                            new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                            new BABYLON.Vector3(0, 0, size),
                            new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
                        ], // 定义线段的点列表
                        updatable: false // 是否允许更新
                    },
					scene
				);
				axisZ.color = new BABYLON.Color3(0, 0, 1);
				let zChar = makeTextPlane('Z', 'blue', size / 10);
				zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
			};

			showAxis(6);

			/***************************************************************/
			return scene;
		}

        async function initFunction() {
            var asyncEngineCreation = async function () {
                try {
                    return createDefaultEngine();
                } catch (e) {
                    console.log("the available createEngine function failed. Creating the default engine instead");
                    return createDefaultEngine();
                }
            }

            engine = await asyncEngineCreation();
            if (!engine) throw 'engine should not be null.';
            startRenderLoop(engine, canvas);
            scene = createScene();
        };
        
        initFunction().then(() => {
            sceneToRender = scene
        });

        // Resize
        canvas.addEventListener("resize", function () {
            engine.resize();
        });
	});
</script>

<Card size="xl" class="w-full max-w-none 2xl:col-span-2">
    <div class="mb-4 flex items-center justify-between">
        <div class="flex-shrink-0">
            <Heading tag="h3" class="text-2xl">Board View</Heading>
            <p class="text-base font-light text-gray-500 dark:text-gray-400">
                Component View
            </p>
        </div>
        <Change value={12.5} since="" class="justify-end font-medium" />
    </div>

    <!-- Babylon.js Canvas 和边框 -->
    <div class="relative h-full w-full">
        <canvas bind:this={canvas} class="h-full w-full"></canvas>
        <!-- 四个 Viewport 边框 -->
        <div class="absolute border-2 border-gray-500" style="top: 0; left:0; width: 50%; height: 50%; box-sizing: border-box; pointer-events: none;"></div>
        <div class="absolute border-2 border-gray-500" style="top: 0; left:50%; width: 50%; height: 50%; box-sizing: border-box; pointer-events: none;"></div>
        <div class="absolute border-2 border-gray-500" style="top:50%; left:0; width: 50%; height: 50%; box-sizing: border-box; pointer-events: none;"></div>
        <div class="absolute border-2 border-gray-500" style="top:50%; left:50%; width: 50%; height: 50%; box-sizing: border-box; pointer-events: none;"></div>
    </div>

    <div
        class="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 sm:pt-6 dark:border-gray-700"
    >
        <LastRange />
        <More title="Sales Report" href="#top" />
    </div>
</Card>

<style>
    /* 可选：根据需要自定义样式 */
</style>