// Vendor
import * as THREE from 'three';

// Utils
import math from '../utils/math';

// Shaders
import fragment from '../../shaders/thermalVision/fragment';
import vertex from '../../shaders/thermalVision/vertex';

class PlaneStream extends THREE.Object3D {
    constructor(options) {
        super();

        this._settings = {
            color1: '#0000ff',
            color2: '#ffff00',
            color3: '#ff0000',
            activeColorTheme: 0,
            colorsThemes: [
                {
                    color1: '#0000ff',
                    color2: '#ffff00',
                    color3: '#ff0000',
                },
                {
                    color1: '#00ff00',
                    color2: '#ffff00',
                    color3: '#ff00ff',
                },
                {
                    color1: '#ffffff',
                    color2: '#757575',
                    color3: '#000000',
                },
            ]
        }

        this._width = options.width;
        this._height = options.height;

        this._debugger = options.debugger;

        this._stream = options.stream;

        this._plane = this._setupPlane();

        this._setupDebug();
    }

    /**
     * Public
     */
    update(time, deltaTime, fps) {
        this._plane.material.uniforms.u_time.value = time * 0.5;
    }

    resize(width, height) {
        this._width = width;
        this._height = height;

        this._plane.scale.set(width, height);
        this._plane.material.uniforms.u_resolution.value.set(width, height);
    }

    /**
     * Private
     */
    _setupPlane() {
        const geometry = new THREE.PlaneGeometry(1, 1, 32);
        const texture = new THREE.VideoTexture(this._stream);

        const uniforms = {
            u_stream: { value: texture },
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(this._width, this._height) },
            u_aspect_ratio: { value: new THREE.Vector2(this._stream.width, this._stream.height) },
            u_color_1: { value: new THREE.Color(this._settings.color1) },
            u_color_2: { value: new THREE.Color(this._settings.color2) },
            u_color_3: { value: new THREE.Color(this._settings.color3) },
        }

        console.log(this._stream);

        const material = new THREE.ShaderMaterial({
            uniforms,
            fragmentShader: fragment,
            vertexShader: vertex,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(this._width, this._height);

        this.add(mesh);

        return mesh;
    }

    _setupDebug() {
        this._debugger.addFolder({ title: 'Camera Stream' });

        this._debugger.addInput(this._settings, 'color1').on('change', () => {
            this._plane.material.uniforms.u_color_1.value.set(this._settings.color1);
        });
        this._debugger.addInput(this._settings, 'color2').on('change', () => {
            this._plane.material.uniforms.u_color_2.value.set(this._settings.color2);
        });
        this._debugger.addInput(this._settings, 'color3').on('change', () => {
            this._plane.material.uniforms.u_color_3.value.set(this._settings.color3);
        });

        this._debugger.addButton({ title: 'Switch Colors' }).on('click', () => {
            this._settings.activeColorTheme = math.modulo(this._settings.activeColorTheme + 1, this._settings.colorsThemes.length);

            this._plane.material.uniforms.u_color_1.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color1);
            this._plane.material.uniforms.u_color_2.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color2);
            this._plane.material.uniforms.u_color_3.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color3);

            this._settings.color1 = this._settings.colorsThemes[this._settings.activeColorTheme].color1;
            this._settings.color2 = this._settings.colorsThemes[this._settings.activeColorTheme].color2;
            this._settings.color3 = this._settings.colorsThemes[this._settings.activeColorTheme].color3;

            this._debugger.refresh();
        });
    }
}

export default PlaneStream;