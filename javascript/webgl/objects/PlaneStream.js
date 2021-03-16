// Vendor
import * as THREE from 'three';

// Materials
import ThermalVisionMaterial from '../materials/ThermalVisionMaterial';

class PlaneStream extends THREE.Object3D {
    constructor(options) {
        super();

        this._width = options.width;
        this._height = options.height;

        this._debugger = options.debugger;

        this._stream = options.stream;

        this._material = this._setupMaterial();
        this._plane = this._setupPlane();
    }

    /**
     * Public
     */
    update(time, deltaTime, fps) {
        this._material.update(time, deltaTime, fps);
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._plane.scale.set(width, height);
        this._material.resize(width, height);
    }

    /**
     * Private
     */
    _setupMaterial() {
        const material = new ThermalVisionMaterial({
            stream: this._stream,
            debugger: this._debugger,
            width: this._width,
            height: this._height
        });

        return material;
    }

    _setupPlane() {
        const geometry = new THREE.PlaneGeometry(1, 1, 32);

        const mesh = new THREE.Mesh(geometry, this._material);
        mesh.scale.set(this._width, this._height);

        this.add(mesh);

        return mesh;
    }
}

export default PlaneStream;