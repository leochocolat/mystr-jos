// Vendor
import { Scene, PerspectiveCamera, MeshNormalMaterial } from 'three';
import ThreeGLTFDracoLoader from '../../loaders/ThreeGLTFDracoLoader';
import DeviceOrientationControls from '../../utils/DeviceOrientationControls';

class GyroscopeScene extends Scene {
    constructor(options) {
        super();

        this._settings = {
            rotationAmplitude: { x: 30, y: 30, z: 0 },
            damping: 0.1,
        };

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
        if (!this._deviceOrientationControls) return;
        this._deviceOrientationControls.update();
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }

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

            this._deviceOrientationControls = new DeviceOrientationControls(this._camera, {
                amplitudeRanges: this._settings.rotationAmplitude,
                damping: this._settings.damping,
            });
        });

        return model;
    }

    _setupDebug() {
        const GyroSceneFolder = this._debugger.addFolder({ title: 'Gyro Scene' });

        GyroSceneFolder.addInput(this._settings.rotationAmplitude, 'x', { label: 'amplitude x', min: 0, max: 90 }).on('change', () => {
            this._deviceOrientationControls.amplitudeRanges = this._settings.rotationAmplitude;
        });

        GyroSceneFolder.addInput(this._settings.rotationAmplitude, 'y', { label: 'amplitude y', min: 0, max: 90 }).on('change', () => {
            this._deviceOrientationControls.amplitudeRanges = this._settings.rotationAmplitude;
        });

        GyroSceneFolder.addInput(this._settings.rotationAmplitude, 'z', { label: 'amplitude z', min: 0, max: 90 }).on('change', () => {
            this._deviceOrientationControls.amplitudeRanges = this._settings.rotationAmplitude;
        });

        GyroSceneFolder.addInput(this._settings, 'damping', { min: 0, max: 1 }).on('change', () => {
            this._deviceOrientationControls.damping = this._settings.damping;
        })

        return GyroSceneFolder;
    }
}

export default GyroscopeScene;