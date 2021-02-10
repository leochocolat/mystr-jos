class StreamVideo {
    constructor() {
        this._isStreamAvailable = false;

        this._contraints = {
            video: {
                width: { ideal: 1600 }, 
                height: { ideal: 900 },
                facingMode: 'user'
            }
        }

        this._video = this._createVideoElement();
    }

    /**
     * Public
     */
    get video() {
        return this._video;
    }

    get isStreamAvailable() {
        return this._isStreamAvailable;
    }

    getStreamVideo() {
        const promise = new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(this._contraints)
            .then((mediaStream) => {
                this._videoTrack = mediaStream.getVideoTracks()[0];
                this._isStreamAvailable = true;
                this._video.srcObject = mediaStream;
                this._video.play();
                resolve(this._video);
            })
            .catch((error) => {
                reject(error);
            })
        });

        return promise;
    }

    switchFacingMode() {
        this._contraints.video.facingMode = this._contraints.video.facingMode === 'user' ? 'environment' : 'user';
        this._videoTrack.applyConstraints(this._contraints);
    }

    /**
     * Private
     */
    _createVideoElement() {
        const video = document.createElement('video');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.width = 1600;
        video.height = 900;
        video.style.position = 'fixed';
        video.style.right = 0;
        video.style.bottom = 0;
        video.style.transform = 'scaleX(-1)';
        video.style.opacity = 0.5;
        video.style.visibility = 'hidden';
        document.body.appendChild(video);

        return video;
    }
}

export default StreamVideo;