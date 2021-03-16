// Vendor
import * as THREE from 'three'; 
import { LinearFilter } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader.js';
import { BasisTextureLoader } from '../../vendors/three/BasisTextureLoader';
// import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { KTX2Loader } from '../../vendors/three/KTX2Loader';


const PESPECTIVE = 800;

const PATH_TO_TEXTURES = './public/textures';

class BasisScene extends THREE.Scene {
    constructor(options) {
        super();

        this._settings = {
            textureType: 'basisEtc1s',
            basisTextures: {
                basisEtc1s: 'skybox_etc1s',
                basisEtc1sHq: 'skybox_etc1s_hq',
                basisEtc1sQ50: 'skybox_etc1s_q_50',
                basisEtc1sQ10: 'skybox_etc1s_q_10',
                basisUastc: 'skybox_uastc',
                cubemap: 'cubemap',
                cubemap_1: 'cubemap_1',
            }
        }

        this._renderer = options.renderer;

        this._width = options.width;
        this._height = options.height;

        this._debugger = options.debugger;

        this._stream = options.stream;

        this._camera = this._setupCamera();
        this._orbitControl = this._setupOrbitControl();
        this._material = this._setupMaterial();
        this._skybox = this._setupSkybox();

        // this._loadClassicTexture();
        // this._loadBasisTextures();
        // this._setupDebug();
        // this._createCubeMap();
        // this._loadKTXTextureCubeMap();
        // this._loadKTXTexture();
        // this._loadBasisTexture('skybox_etc1s_hq');
        // this._createBasisCubeMap();
        this._createBasisCubeMap1();
        this._createBasisCubeMap1();
    }

    /**
     * Public
     */
    get camera() {
        return this._camera;
    }

    update(time, deltaTime, fps) {
        
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        const fov = (180 * (2 * Math.atan(height / 2 / PESPECTIVE))) / Math.PI;
        this._camera.fov = fov;
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
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

    _setupOrbitControl() {
        const controls = new OrbitControls(this._camera, this._renderer.domElement);
        // this._camera.position.z = 0;
        controls.update();
        return controls;
    }

    _setupMaterial() {
        const material = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
        });

        return material;
    }

    _setupSkybox() {
        const geometry = new THREE.BoxGeometry(200, 200, 200);

        const mesh = new THREE.Mesh(geometry, this._material);
        this.add(mesh);

        return mesh;
    }

    _createCubeMap() {
        const loader = new THREE.CubeTextureLoader();
        loader.setPath( `${PATH_TO_TEXTURES}/cubemaps/` );

        const images = [
            'cubemap_0.png', 
            'cubemap_1.png',
            'cubemap_2.png', 
            'cubemap_3.png',
            'cubemap_4.png', 
            'cubemap_5.png'
        ];

        loader.load(images, (texture) => {
            console.log(texture);
        });
    }

    _createBasisCubeMap() {
        const loader = new BasisTextureLoader();
        loader.setTranscoderPath('./public/vendor/three/examples/js/libs/basis/');
        loader.detectSupport(this._renderer);

        const promises = [];
        const order = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];

        for (let i = 0; i < 6; i++) {
            const fileName = order[i];
            const promise = new Promise((resolve) => {
                loader.load(`${PATH_TO_TEXTURES}/cubemaps/${fileName}.basis`, resolve);
            });
            promises.push(promise);
        }

        Promise.all(promises).then((responses) => {
            const cubeTexture = new THREE.CubeTexture(responses);

            cubeTexture.minFilter = responses[0].minFilter;
            cubeTexture.magFilter = responses[0].magFilter;
            cubeTexture.format = responses[0].format;
            cubeTexture.encoding = responses[0].encoding;
            cubeTexture.needsUpdate = true;

            this.background = cubeTexture;
            this._material.envMap = cubeTexture;

            console.log(cubeTexture);

            // console.log('----');
            // console.log(cubeTexture);
        })
    }

    _createBasisCubeMap1() {
        const loader = new BasisTextureLoader();
        loader.setTranscoderPath('./public/vendor/three/examples/js/libs/basis/');
        loader.detectSupport(this._renderer);

        const fileName = 'cubemap';
        // const fileName = '2dArrayTexture';

        loader.load(`${PATH_TO_TEXTURES}/cubemaps/${fileName}.basis`, (texture) => {
            console.log('----- OUTPUT -----');
            console.log(texture);
            console.log('----- OUTPUT -----');

            this.background = texture;
            this._material.envMap = texture;
        });
    }

    _loadKTXTextureCubeMap() {
        return new Promise((resolve) => {
            new KTX2Loader()
            .setTranscoderPath('./public/vendor/three/examples/js/libs/basis/')
            .detectSupport(this._renderer)
            .load(`${PATH_TO_TEXTURES}/cubemaps/cubemap-2.ktx2`, ( texture ) => {
                    resolve(texture);

                    // this._material.map = texture;
                    // this._material.needsUpdate = true;
                });
        });
        // skybox-mipmap.ktx2
    }

    _loadKTXTexture() {
        return new Promise((resolve) => {
            new KTX2Loader()
            .setTranscoderPath('./public/vendor/three/examples/js/libs/basis/')
            .detectSupport(this._renderer)
            .load(`${PATH_TO_TEXTURES}/skybox-mipmap.ktx2`, ( texture ) => {
                resolve(texture);
                    // this._material.map = texture;
                    // this._material.needsUpdate = true;
                });
        });
        // skybox-mipmap.ktx2
    }

    _loadBasisTextures() {
        const promises = [];
        const textureNames = [];

        for (let i in this._settings.basisTextures) {
            const fileName = this._settings.basisTextures[i];
            textureNames.push(fileName);
            promises.push(this._loadBasisTexture(fileName));
        }

        return Promise.all(promises).then((responses) => {
            this._basisTextures = {};

            for (let i = 0; i < responses.length; i++) {
                const texture = responses[i];
                this._basisTextures[textureNames[i]] = texture;
            }

            // this._applyBasisTexture();
        });
    }

    _loadClassicTexture() {
        const loader = new THREE.TextureLoader();

        const promise = new Promise((resolve) => {
            loader.load(`${PATH_TO_TEXTURES}/skybox.jpg`, (texture) => {
                texture.encoding = THREE.sRGBEncoding;
                texture.flipY = false;
                this._classicTexture = texture;


                
                resolve(texture);
            });
        });

        return promise;
    }

    _loadBasisTexture(name) {
        const loader = new BasisTextureLoader();
        loader.setTranscoderPath('./public/vendor/three/examples/js/libs/basis/');
        loader.detectSupport(this._renderer);

        const promise = new Promise((resolve) => {
            loader.load(`${PATH_TO_TEXTURES}/${name}.basis`, (texture) => {
                texture.type = 'basis';
                texture.encoding = THREE.sRGBEncoding;
                resolve(texture);
                console.log(name);
                console.log(texture);
            });
        })

        return promise;
    }

    _applyBasisTexture() {
        // console.log(this._basisTextures);
        // const texture = this._basisTextures[this._settings.textureType];
        // texture.mapping = THREE.CubeReflectionMapping;
        // texture.isCubeTexture = true;
        // texture._needsFlipEnvMap = true;
		// texture.flipY = false;

        // texture.needsUpdate = true;
        // this.background = texture;

        // this._material.map = texture;
        // this._material.needsUpdate = true;

        // this._flipUv();
    }

    _applyClassicTexture() {
        if (!this._classicTexture) return;
        const texture = this._classicTexture;

        this._material.map = texture;
        this._material.needsUpdate = true;

        this._flipUv();
    }

    _flipUv() {
        if (this._skybox.geometry.attributes.flipedUv) {
            this._skybox.geometry.attributes.uv = this._skybox.geometry.attributes.flipedUv;
        } else {
            const uv = this._skybox.geometry.attributes.uv;
            this._skybox.geometry.attributes.originalUv = uv.clone();
            for (let i = 0; i < uv.count; i ++) {
                uv.setY(i, 1 - uv.getY(i));
            }
            this._skybox.geometry.attributes.uv = uv.clone();
            this._skybox.geometry.attributes.flipedUv = uv.clone();
        }
    }

    _resetUv() {
        if (!this._skybox.geometry.attributes.originalUv) return;
        this._skybox.geometry.attributes.uv = this._skybox.geometry.attributes.originalUv;
    }

    _setupDebug() {
        const basisSceneDebugger = this._debugger.addFolder({ title: 'Basis Texture' });

        basisSceneDebugger.addInput(this._settings, 'textureType', { options: this._settings.basisTextures })
            .on('change', () => {
                this._applyBasisTexture();
            });

        basisSceneDebugger.addButton({ title: 'Apply Classic Texture' })
            .on('click', () => {
                this._applyClassicTexture();
            });
    }
}

export default BasisScene;