// Utils
import EventDispatcher from './EventDispatcher';
import math from './math';

class DeviceOrientationObserver extends EventDispatcher {
    constructor() {
        super();

        if (!window.isSecureContext) console.error('DeviceOrientationObserver: DeviceOrientationEvent is only available in secure contexts (https)');

        this._bindAll();

        this._deviceOrientation = {};
        this._initialDeviceOrientation = null;

	    this._screenOrientation = window.orientation || 0;

        this._isConnected = false;
        
        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') { 
            window.DeviceOrientationEvent.requestPermission()
                .catch((error) => {
                    console.error('DeviceOrientationObserver: Unable to use DeviceOrientation API:', error);
                })
        } else {
            console.error('DeviceOrientationObserver: Unable to use DeviceOrientation API:');
        }

        this._setup();
    }

    /**
     * Public
     */
    destroy() {
        this._removeEventListeners();
    }

    refresh() {
        this._initialDeviceOrientation = null;
        this._screenOrientation = window.orientation || 0;
    }

    /**
     * Private
     */
    _setup() {
        if (this._isConnected) return;

        this._isConnected = true;
        this._setupEventListeners();
    }

    _bindAll() {
        this._screenOrientationchangeHandler = this._screenOrientationchangeHandler.bind(this);
        this._deviceOrientationchangeHandler = this._deviceOrientationchangeHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('orientationchange', this._screenOrientationchangeHandler);
        window.addEventListener('deviceorientation', this._deviceOrientationchangeHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('orientationchange', this._screenOrientationchangeHandler);
        window.removeEventListener('deviceorientation', this._deviceOrientationchangeHandler);
    }

    _screenOrientationchangeHandler() {
        this._screenOrientation = window.orientation || 0;
    }

    _deviceOrientationchangeHandler(event) {
        this._deviceOrientation = event;

        const alpha = event.alpha ? math.degToRad(event.alpha) : 0; // Z
        const beta = event.beta ? math.degToRad(event.beta) : 0; // X'
        const gamma = event.gamma ? math.degToRad(event.gamma) : 0; // Y''
        const orient = this._screenOrientation ? math.degToRad(this._screenOrientation) : 0; // O

        if (!this._initialDeviceOrientation) {
            this._initialDeviceOrientation = { alpha, beta, gamma, orient };
        }

        this.dispatchEvent('deviceorientation', {
            alpha,
            beta,
            gamma,
            orient,
            initialDeviceOrientation: this._initialDeviceOrientation,
            originalEvent: event
        });
    }

    /**
     * Utils
     */
    _deepClone(array) {
        return JSON.parse(JSON.stringify(array));
    }
}

export default DeviceOrientationObserver;