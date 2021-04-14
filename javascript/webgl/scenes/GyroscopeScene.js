// Vendor
import { Scene, PerspectiveCamera, MeshNormalMaterial, Euler, Quaternion, Vector3 } from 'three';
import ThreeGLTFDracoLoader from '../../loaders/ThreeGLTFDracoLoader';
import math from '../../utils/math';

class GyroscopeScene extends Scene {
    constructor(options) {
        super();

        this._settings = {
            rotationAmplitude: { x: 30, y: 30 },
            damping: 0.1,
        };

        this._cameraRotation = {
            target: new Euler(),
        }

        this._initialDeviceEuler = null;

        this._renderer = options.renderer;

        this._width = options.width;
        this._height = options.height;

        this._debugger = options.debugger;

        this._camera = this._setupCamera();
        this._model = this._setupModel();
        this._debug = this._setupDebug();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, deltaTime, fps) {
        this._updateCameraRotation();   
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }
    
    deviceorientation(e) {
        let { alpha, beta, gamma, orient, initialDeviceOrientation } = e;

        const zee = new Vector3(0, 0, 1);
		const q0 = new Quaternion().setFromAxisAngle(zee, -orient); // adjust for screen orientation
		const q1 = new Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        // Device
        const deviceEuler = new Euler();
        deviceEuler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

        const deviceQuaternion = new Quaternion();
        deviceQuaternion.setFromEuler(deviceEuler); // orient the device
        deviceQuaternion.multiply(q1);
        deviceQuaternion.multiply(q0);

        // Get initial Initial Device euler if not defined
        if (!this._initialDeviceEuler) {
            const initialDeviceEuler = new Euler();
            initialDeviceEuler.set(initialDeviceOrientation.beta, initialDeviceOrientation.alpha, - initialDeviceOrientation.gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

            const initialDeviceQuaternion = new Quaternion();
            initialDeviceQuaternion.setFromEuler(initialDeviceEuler);
            initialDeviceQuaternion.multiply(q1);
            initialDeviceQuaternion.multiply(q0);

            this._initialDeviceEuler = new Euler().setFromQuaternion(initialDeviceQuaternion);
        }
        
        // Transform to Euler angle
        const finalEuler = new Euler().setFromQuaternion(deviceQuaternion);
        finalEuler.x -= this._initialDeviceEuler.x; // Look Forward

        const amplitudeX = math.degToRad(this._settings.rotationAmplitude.x);
        const amplitudeY = math.degToRad(this._settings.rotationAmplitude.y);

        this._cameraRotation.target.x = math.clamp(finalEuler.x, -amplitudeX, amplitudeX);
        this._cameraRotation.target.y = math.clamp(finalEuler.y, -amplitudeY, amplitudeY);
    }

    devicemotion(e) {}

    /**
     * Private
     */
    _setupCamera() {
        const camera = new PerspectiveCamera(75, this._width / this._height, 0.1, 10000);
        camera.position.z = -1;

        return camera;
    }

    _setupModel() {
        const loader = new ThreeGLTFDracoLoader({
            decoderPath: './public/vendor/draco/'
        });

        let model;

        loader.load({ path: './public/models/Hallway.glb' }).then((response) => {
            
            model = response.scene;

            model.traverse(child => {
                if (child.isMesh) {
                    child.material = new MeshNormalMaterial();
                };
            })

            this._camera = response.cameras[0];
            this._camera.position.z -= 50;
            this._camera.aspect = this._width / this._height;
            this._camera.updateProjectionMatrix();

            this.add(model);
        });

        return model;
    }

    _updateCameraRotation() {
        // Lerp camera rotation
        this._camera.rotation.x = math.lerp(this._camera.rotation.x, this._cameraRotation.target.x, this._settings.damping);
        this._camera.rotation.y = math.lerp(this._camera.rotation.y, this._cameraRotation.target.y, this._settings.damping);

        // Without Lerp
        // this._camera.rotation.x = this._cameraRotation.target.x;
        // this._camera.rotation.y = this._cameraRotation.target.y;
    }

    _setupDebug() {
        const GyroSceneFolder = this._debugger.addFolder({ title: 'Gyro Scene' });
        GyroSceneFolder.addInput(this._settings.rotationAmplitude, 'x', { label: 'amplitude x', min: 0, max: 90 });
        GyroSceneFolder.addInput(this._settings.rotationAmplitude, 'y', { label: 'amplitude y', min: 0, max: 90 });
        GyroSceneFolder.addInput(this._settings, 'damping', { min: 0, max: 1 });

        return GyroSceneFolder;
    }
}

export default GyroscopeScene;