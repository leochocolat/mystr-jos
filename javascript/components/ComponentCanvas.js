// Vendor
import { WebGLRenderer } from 'three';
import gsap from 'gsap';
import Tweakpane from 'tweakpane';

// Utils
import WindowResizeObserver from '../utils/WindowResizeObserver';
import DeviceOrientationObserver from '../utils/DeviceOrientationObserver';
import DeviceMotionObserver from '../utils/DeviceMotionObserver';

// Modules
import GyroscopeScene from '../webgl/scenes/GyroscopeScene';

class ComponentCanvas {
    constructor(options) {
        this.el = options.el;

        this._settings = {
            scale: 1,
        } 

        this._bindAll();
        this._setup();
    }

    /**
     * Private
     */
    _setup() {
        this._width = WindowResizeObserver.width * this._settings.scale;
        this._height = WindowResizeObserver.height * this._settings.scale;

        this._setupDeltaTime();
        this._setupWebGL();
        this._setupDebug();
        this._setupScene();
        this._setupEventListeners();
    }

    _setupDeltaTime() {
        this._time = 0;
        this._startTime = Date.now();
        this._dateNow = this._startTime;
        this._lastTime = this._dateNow;
        this._deltaTime = 16;
        this._fps = Math.round(1000 / this._deltaTime);
    }

    _setupWebGL() {
        this._renderer = new WebGLRenderer({
            antialias: true,
            canvas: this.el,
        });

        this._renderer.setSize(this._width, this._height, false);
    }

    _setupScene() {
        this._scene = new GyroscopeScene({
            renderer: this._renderer,
            width: this._width,
            height: this._height,
            debugger: this._debugger
        });
    }

    _setupDebug() {
        this._debugger = new Tweakpane({ title: 'Debugger', expanded: true });

        const performanceFolder = this._debugger.addFolder({ title: 'Performances', expanded: true });

        performanceFolder.addMonitor(this, '_fps', { label: 'FPS' });
        performanceFolder.addMonitor(this, '_fps', {
            label: 'FPS GRAPH',
            view: 'graph',
            min: 0,
            max: 100,
        });
    }

    /**
     * On Tick
     */
    _update() {
        this._scene.update(this._time, this._deltaTime, this._fps);
        this._renderer.render(this._scene, this._scene.camera);
    }

    _updateDeltaTime() {
        this._dateNow = Date.now();
        this._time = (this._dateNow - this._startTime) / 1000;
        this._deltaTime = this._dateNow - this._lastTime;
        this._lastTime = this._dateNow;
        this._fps = Math.round(1000 / this._deltaTime);
    }

    _resize(width, height) {
        this._width = width * this._settings.scale;
        this._height = height * this._settings.scale;

        this._renderer.setSize(this._width, this._height, false);
        this._scene.resize(this._width, this._height);
    }

    /**
     * Events
     */
    _bindAll() {
        this._resizeHandler = this._resizeHandler.bind(this);
        this._tickHandler = this._tickHandler.bind(this);
        this._clickHandler = this._clickHandler.bind(this);
        this._deviceorientationHandler = this._deviceorientationHandler.bind(this);
        this._deviceMotionHandler = this._deviceMotionHandler.bind(this);
    }

    _setupEventListeners() {
        WindowResizeObserver.addEventListener('resize', this._resizeHandler);
        gsap.ticker.add(this._tickHandler);
        this.el.addEventListener('click', this._clickHandler);    
    }

    /**
     * Handlers
     */
    _resizeHandler(e) {
        const { width, height } = e;
        this._resize(width, height);
    }

    _tickHandler() {
        this._update();
        this._updateDeltaTime();

        if (!this._controls) return;
        this._controls.update();
    }

    _clickHandler() {
        this._deviceOrientationObserver = new DeviceOrientationObserver();
        this._deviceOrientationObserver.addEventListener('deviceorientation', this._deviceorientationHandler);

        this._deviceMotionObserver = new DeviceMotionObserver();
        this._deviceMotionObserver.addEventListener('devicemotion', this._deviceMotionHandler);
    }

    _deviceorientationHandler(e) {
        this._scene.deviceorientation(e);
    }

    _deviceMotionHandler(e) {
        this._scene.devicemotion(e);
    }
}

export default ComponentCanvas;