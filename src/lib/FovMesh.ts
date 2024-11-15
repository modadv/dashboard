import * as BABYLON from 'babylonjs';

export class FovMes extends BABYLON.Mesh {
    private rotating:boolean;
    
    constructor(name:string, scene:BABYLON.Scene) {
        super(name, scene);
        this.rotating = false;

        scene.onPointerObservable((pointerInfo : BABYLON.PointerInfo) => {
            if (pointerInfo.pickInfo) {
                if (pointerInfo.type === 1) {
                    if (pointerInfo.pickInfo.pickedMesh === this) {
                        rotating = true;
                    }
                }
            }
        })
    }
}