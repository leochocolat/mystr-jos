// Vendor
import { Euler, Quaternion, Vector3 } from 'three';

// Utils
import EventDispatcher from './EventDispatcher';
import math from './math';

class DeviceOrientationControls extends EventDispatcher {
    constructor(object, options = {}) {
        super();

        // Check secure context
        if (!window.isSecureContext) {
            console.error('DeviceOrientationObserver: DeviceOrientationEvent is only available in secure contexts (https)');
        }

        // Check availability
        if (window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function') { 
            window.DeviceOrientationEvent.requestPermission().catch((error) => {
                console.error('DeviceOrientationObserver: Unable to use DeviceOrientation API:', error);
            });
        } else {
            console.error('DeviceOrientationObserver: Unable to use DeviceOrientation API:');
        }

        this._initialDeviceOrientation = null;
        this._deviceOrientation = null;
        this._initialDeviceEuler = null;
        this._initialDeviceQuaternion = new Quaternion();
        this._targetRotation = new Euler();

        this._object = object; // Object to rotate

        this._amplitudeRanges = options.amplitudeRanges || new Vector3(180, 180, 180); // Degrees
        this._damping = options.damping || 1; // Lerp value

        this._setup();
    }

    /**
     * Public
     */
    set object(newObject) {
        this._object = newObject;
    }

    get object() {
        return this._object;
    }

    set damping(newDamping) {
        this._damping = newDamping;
    }

    get damping() {
        return this._damping;
    }

    set amplitudeRanges(newAmplitude) {
        this._amplitudeRanges = newAmplitude;
    }

    get amplitudeRanges() {
        return this._amplitudeRanges;
    }

    dispose() {
        this._removeEventListeners();
    }

    // Update initial device orientation to set rotation x offset
    refresh() {
        this._initialDeviceOrientation = null;
        this._initialDeviceEuler = null;
        this._initialDeviceQuaternion = new Quaternion();
    }

    update() {
        if (!this._deviceOrientation) return;

        this._applyRotation(this._deviceOrientation);
    }

    /**
     * Private
     */
    _setup() {
        this._bindAll();
        this._setupEventListeners();
    }

    // Todo: Optimize instance creations (Vector, Quaternions and Euler)
    _applyRotation(deviceOrientation) {
        const { alpha, beta, gamma, orient } = deviceOrientation;

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

        if (!this._initialDeviceEuler) {
            this._initialDeviceEuler = new Euler();
            this._initialDeviceEuler.set(this._initialDeviceOrientation.beta, this._initialDeviceOrientation.alpha, - this._initialDeviceOrientation.gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

            this._initialDeviceQuaternion.setFromEuler(this._initialDeviceEuler);
            this._initialDeviceQuaternion.multiply(q1);
            this._initialDeviceQuaternion.multiply(q0);

            this._initialDeviceEuler.setFromQuaternion(this._initialDeviceQuaternion);
        }

        const finalEuler = new Euler().setFromQuaternion(deviceQuaternion);
        finalEuler.x -= this._initialDeviceEuler.x; // Look Forward

        const amplitudeX = this._amplitudeRanges ? math.degToRad(this._amplitudeRanges.x) : 179.99;
        const amplitudeY = this._amplitudeRanges ? math.degToRad(this._amplitudeRanges.y) : 179.99;
        const amplitudeZ = this._amplitudeRanges ? math.degToRad(this._amplitudeRanges.z) : 179.99;

        this._targetRotation.x = math.clamp(finalEuler.x, -amplitudeX, amplitudeX);
        this._targetRotation.y = math.clamp(finalEuler.y, -amplitudeY, amplitudeY);
        this._targetRotation.z = math.clamp(finalEuler.z, -amplitudeZ, amplitudeZ);
        
        // Lerp
        this._object.rotation.x = math.lerp(this._object.rotation.x, this._targetRotation.x, this._damping);
        this._object.rotation.y = math.lerp(this._object.rotation.y, this._targetRotation.y, this._damping);
        this._object.rotation.z = math.lerp(this._object.rotation.z, this._targetRotation.z, this._damping);
    }

    // Events
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

    // Handlers
    _screenOrientationchangeHandler() {
        this._screenOrientation = window.orientation || 0;
    }

    _deviceOrientationchangeHandler(event) {
        const alpha = event.alpha ? math.degToRad(event.alpha) : 0; // Z
        const beta = event.beta ? math.degToRad(event.beta) : 0; // X'
        const gamma = event.gamma ? math.degToRad(event.gamma) : 0; // Y''
        const orient = this._screenOrientation ? math.degToRad(this._screenOrientation) : 0; // O

        this._deviceOrientation = { alpha, beta, gamma, orient, native: event };

        if (!this._initialDeviceOrientation) {
            this._initialDeviceOrientation = { alpha, beta, gamma, native: event };
        }
    }
}

export default DeviceOrientationControls;