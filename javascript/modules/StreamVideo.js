class StreamVideo {
    constructor() {
        this._isStreamAvailable = false;
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
        const constraints = { video: { width: 1600, height: 900 } };

        const promise = new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(constraints)
            .then((mediaStream) => {
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