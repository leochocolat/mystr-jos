import EventDispatcher from './EventDispatcher';
import math from './math';

class DeviceOrientationControls extends EventDispatcher {
    constructor(options = {}) {
        super();

        if (!window.isSecureContext) console.error('DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)');

        this._bindAll();

        this._deviceOrientation = {};
        this._initialDeviceOrientation = null;

	    this._screenOrientation = window.orientation || 0;

        this._isConnected = false;
        
        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') { 
            window.DeviceOrientationEvent.requestPermission()
                .then((response) => {
                    if (response === 'granted') {
                        this._setup();            
                    }
                })
                .catch((error) => {
                    console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
                })
        } else {
            console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:');
        }
    }

    /**
     * Public
     */
    destroy() {
        this._removeEventListeners();
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
        if (!this._initialDeviceOrientation) this._initialDeviceOrientation = event; // Assign initial device orient once

        this._deviceOrientation = event;
        
        const newAlpha = event.alpha;
        const newBeta = event.beta;
        // const newBeta = event.beta + 90 - Math.abs(this._initialDeviceOrientation.beta); // Set the X orientation forward
        const newGamma = event.gamma;

        const alpha = newAlpha ? math.degToRad(newAlpha) : 0; // Z
        const beta = newBeta ? math.degToRad(newBeta) : 0; // X'
        const gamma = newGamma ? math.degToRad(newGamma) : 0; // Y''
        const orient = this._screenOrientation ? math.degToRad(this._screenOrientation) : 0; // O

        console.log(newBeta);

        this.dispatchEvent('deviceorientation', {
            alpha,
            beta,
            gamma,
            orient,
        });
    }

    /**
     * Utils
     */
    _deepClone(array) {
        return JSON.parse(JSON.stringify(array));
    }
}

export default DeviceOrientationControls;