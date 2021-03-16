// Vendor
import * as THREE from 'three';

// Shaders
import fragment from '../shaders/thermalVision/fragment';
import vertex from '../shaders/thermalVision/vertex';

// Utils
import math from '../../utils/math';

class ThermalVisionMaterial extends THREE.ShaderMaterial {
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

        this._stream = options.stream;
        this._debugger = options.debugger;
        this.uniforms = this._setupUniforms();
        this.fragmentShader = fragment;
        this.vertexShader = vertex;

        this._setupDebug();
    }

    /**
     * Public
     */
    update(time, deltaTime, fps) {
        this.uniforms.u_time.value = time * 0.5;
    }

    resize(width, height) {
        this.uniforms.u_resolution.value.set(width, height);
    }

    /**
     * Private
     */
    _setupUniforms() {
        const texture = new THREE.VideoTexture(this._stream.video);

        const uniforms = {
            u_stream: { value: texture },
            u_time: { value: 0 },
            u_resolution: { value: new THREE.Vector2(this._width, this._height) },
            u_aspect_ratio: { value: new THREE.Vector2(this._stream.video.width, this._stream.video.height) },
            u_color_1: { value: new THREE.Color(this._settings.color1) },
            u_color_2: { value: new THREE.Color(this._settings.color2) },
            u_color_3: { value: new THREE.Color(this._settings.color3) },
        }

        return uniforms;
    }

    _setupDebug() {
        const thermalVisionDebugger = this._debugger.addFolder({ title: 'Thermal Vision' });

        thermalVisionDebugger.addInput(this._settings, 'color1').on('change', () => {
            this.uniforms.u_color_1.value.set(this._settings.color1);
        });
        thermalVisionDebugger.addInput(this._settings, 'color2').on('change', () => {
            this.uniforms.u_color_2.value.set(this._settings.color2);
        });
        thermalVisionDebugger.addInput(this._settings, 'color3').on('change', () => {
            this.uniforms.u_color_3.value.set(this._settings.color3);
        });

        thermalVisionDebugger.addButton({ title: 'Switch Colors' }).on('click', () => {
            this._settings.activeColorTheme = math.modulo(this._settings.activeColorTheme + 1, this._settings.colorsThemes.length);

            this.uniforms.u_color_1.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color1);
            this.uniforms.u_color_2.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color2);
            this.uniforms.u_color_3.value.set(this._settings.colorsThemes[this._settings.activeColorTheme].color3);

            this._settings.color1 = this._settings.colorsThemes[this._settings.activeColorTheme].color1;
            this._settings.color2 = this._settings.colorsThemes[this._settings.activeColorTheme].color2;
            this._settings.color3 = this._settings.colorsThemes[this._settings.activeColorTheme].color3;

            this._debugger.refresh();
        });
    }
}

export default ThermalVisionMaterial;