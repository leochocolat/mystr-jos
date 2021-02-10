uniform float u_time;

uniform sampler2D u_stream;
uniform vec2 u_resolution;

varying vec2 v_uv;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{   
	vec2 uv = v_uv;
    vec4 color = texture2D(u_stream, uv);
	
	// Outline
	fragColor = vec4((min(fwidth(color) * 7.0, 1.0)));
}

void main() {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}