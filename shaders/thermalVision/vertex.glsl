varying vec2 v_uv;

void main() {
    // Mirror
    v_uv = vec2(1.0 - uv.x, uv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}