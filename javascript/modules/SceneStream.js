// Vendor
import * as THREE from 'three'; 

// Modules
import PlaneStream from './PlaneStream';

const PESPECTIVE = 800;

class SceneStream extends THREE.Scene {
    constructor(options) {
        super();

        this._width = options.width;
        this._height = options.height;

        this._debugger = options.debugger;

        this._stream = options.stream;

        this._camera = this._setupCamera();
        this._plane = this._setupPlane();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, deltaTime, fps) {
        this._plane.update(time, deltaTime, fps);
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        const fov = (180 * (2 * Math.atan(height / 2 / PESPECTIVE))) / Math.PI;
        this._camera.fov = fov;
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();

        this._plane.resize(width, height);
    }

    /**
     * Private
     */
    _setupCamera() {
        const fov = (180 * (2 * Math.atan(this._height / 2 / PESPECTIVE))) / Math.PI;
        const camera = new THREE.PerspectiveCamera(fov, this._width / this._height, 1, 1000);
        camera.position.set(0, 0, PESPECTIVE);

        return camera;
    }

    _setupPlane() {
        const plane = new PlaneStream({
            width: this._width,
            height: this._height,
            stream: this._stream,
            debugger: this._debugger,
        });

        this.add(plane);

        return plane;
    }
}

export default SceneStream;