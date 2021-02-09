export default function isTouch() {
    if (!process.client) return false;
    return 'ontouchstart' in window;
}
