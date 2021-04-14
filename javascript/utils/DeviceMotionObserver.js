// Utils
import EventDispatcher from './EventDispatcher';

class DeviceMotionObserver extends EventDispatcher {
    constructor() {
    super();

        if (!window.isSecureContext) console.error('DeviceMotionObserver: DeviceMotionEvent is only available in secure contexts (https)');

        this._bindAll();

        this._deviceOrientation = {};

	    this._screenOrientation = window.orientation || 0;
        
        if (window.DeviceMotionEvent !== undefined && typeof window.DeviceMotionEvent.requestPermission === 'function') { 
            window.DeviceMotionEvent.requestPermission().catch((error) => {
                console.error('DeviceMotionObserver: Unable to use DeviceMotion API:', error);
            });
        } else {
            console.error('DeviceMotionObserver: Unable to use DeviceMotion API:');
        }

        this._setup();
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
        this._setupEventListeners();
    }

    _bindAll() {
        this._screenOrientationchangeHandler = this._screenOrientationchangeHandler.bind(this);
        this._deviceMotionHandler = this._deviceMotionHandler.bind(this);
    }

    _setupEventListeners() {
        window.addEventListener('orientationchange', this._screenOrientationchangeHandler);
        window.addEventListener('devicemotion', this._deviceMotionHandler);
    }

    _removeEventListeners() {
        window.removeEventListener('orientationchange', this._screenOrientationchangeHandler);
        window.removeEventListener('devicemotion', this._deviceMotionHandler);
    }

    _screenOrientationchangeHandler() {
        this._screenOrientation = window.orientation || 0;
    }

    _deviceMotionHandler(event) {
        this.dispatchEvent('devicemotion', event);
    }
}

export default DeviceMotionObserver;