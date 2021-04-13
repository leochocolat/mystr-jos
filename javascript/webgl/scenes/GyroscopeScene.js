// Vendor
import * as THREE from 'three';
import ThreeGLTFDracoLoader from '../../loaders/ThreeGLTFDracoLoader';

class GyroscopeScene extends THREE.Scene {
    constructor(options) {
        super();

        this._settings = {
            positionFactor: { x: 5, y: 2 },
            rotationFactor: { x: -30, y: 30 },// Degrees
            damping: 0.1,
        };

        this._cameraPosition = {
            current: new THREE.Vector3(0, 0, 0),
            target: new THREE.Vector3(0, 0, 0),
        };

        this._cameraRotation = {
            current: new THREE.Vector3(0, 0, 0),
            target: new THREE.Vector3(0, 0, 0),
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
        this._updateCameraPosition();   
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }
    
    deviceorientation(e) {
        const { alpha, beta, gamma, orient } = e;

        const zee = new THREE.Vector3(0, 0, 1);
		const euler = new THREE.Euler();
		const q0 = new THREE.Quaternion();
		const q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        this._camera.quaternion.setFromEuler(euler); // orient the device
        this._camera.quaternion.multiply(q1); // camera looks out the back of the device, not the top
        this._camera.quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation

        // console.log('rotation y ' + deviceRotationY);
        // console.log('rotation x ' + deviceRotationX);
        
        // const positionFactor = this._settings.positionFactor;
        // const rotationFactor = this._settings.rotationFactor;

        // // Position
        // this._cameraPosition.target.x = deviceRotationY * positionFactor.x;
        // this._cameraPosition.target.y = deviceRotationX * positionFactor.y;

        // // Rotation
        // this._cameraRotation.target.x = deviceRotationX * rotationFactor.x * (Math.PI / 180);
        // this._cameraRotation.target.y = deviceRotationY * rotationFactor.y * (Math.PI / 180);
    }

    /**
     * Private
     */
    _setupCamera() {
        const camera = new THREE.PerspectiveCamera(75, this._width / this._height, 0.1, 10000);
        camera.position.z = -1;

        return camera;
    }

    _setupCube() {
        const geometry = new THREE.BoxGeometry(this._width / 3, this._width / 3, this._width / 3);
        const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);

        this.add(mesh);

        return mesh;
    }

    _setupModel() {
        const loader = new ThreeGLTFDracoLoader({
            decoderPath: './public/vendor/draco/'
        });

        let model;

        loader.load({ path: './public/models/Hallway.glb' }).then((response) => {
            
            model = response.scene;

            model.position.y = 10;

            model.traverse(child => {
                if (child.isMesh) {
                    child.material = new THREE.MeshNormalMaterial();
                };
            })

            this._camera = response.cameras[0];
            this._camera.aspect = this._width / this._height;
            this._camera.updateProjectionMatrix();

            this.add(model);
        });

        return model;
    }

    _updateCameraPosition() {
        const damping = this._settings.damping;

        // Position
        // this._cameraPosition.current.x = math.lerp(this._cameraPosition.current.x, this._cameraPosition.target.x, damping);
        // this._cameraPosition.current.y = math.lerp(this._cameraPosition.current.y, this._cameraPosition.target.y, damping);

        // Rotation
        // this._cameraRotation.current.x = math.lerp(this._cameraRotation.current.x, this._cameraRotation.target.x, damping);
        // this._cameraRotation.current.y = math.lerp(this._cameraRotation.current.y, this._cameraRotation.target.y, damping);

        // console.log(this._cameraPosition.current);

        // this._camera.position.set(this._cameraPosition.target.x, this._cameraPosition.target.y, this._cameraPosition.target.z);
        // this._camera.rotation.set(this._cameraRotation.target.x, this._cameraRotation.target.y, this._cameraRotation.target.z);
    }

    _setupDebug() {
        const GyroSceneFolder = this._debugger.addFolder({ title: 'Gyro Scene' });
        GyroSceneFolder.addInput(this._settings.positionFactor, 'x', { label: 'pos factor x', min: -100, max: 100 });
        GyroSceneFolder.addInput(this._settings.positionFactor, 'y', { label: 'pos factor y', min: -100, max: 100 });
        GyroSceneFolder.addInput(this._settings.rotationFactor, 'x', { label: 'rot factor x', min: -180, max: 180 });
        GyroSceneFolder.addInput(this._settings.rotationFactor, 'y', { label: 'rot factor y', min: -180, max: 180 });
        GyroSceneFolder.addInput(this._settings, 'damping', { min: -1, max: 1 });

        return GyroSceneFolder;
    }
}

export default GyroscopeScene;