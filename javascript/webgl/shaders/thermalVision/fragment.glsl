uniform float u_time;

uniform sampler2D u_stream;
uniform vec2 u_resolution;
uniform vec2 u_aspect_ratio;

uniform vec3 u_color_1;
uniform vec3 u_color_2;
uniform vec3 u_color_3;

varying vec2 v_uv;

float hash12(vec2 p) {
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 uv) {
	float n0 = hash12(uv.xy + u_time * 6.0);
	float n1 = hash12(uv.xy - u_time * 4.0);
	vec4 noiseTexture0 = vec4(vec3(n0), 1.0);
	vec4 noiseTexture1 = vec4(vec3(n1), 1.0);
	return clamp(noiseTexture0.r + noiseTexture1.g, 0.96, 1.0);
}

vec2 crt(vec2 coord, float bend) {
	// put in symmetrical coords
	coord = (coord - 0.5) * 2.0;

	coord *= 0.5;
	
	// deform coords
	coord.x *= 1.0 + pow((abs(coord.y) / bend), 2.0);
	coord.y *= 1.0 + pow((abs(coord.x) / bend), 2.0);

	// transform back to 0.0 - 1.0 space
	coord  = (coord / 1.0) + 0.5;

	return coord;
}

float scanline(vec2 uv) {
	return sin(u_resolution.y * uv.y * 0.7 - u_time * 10.0);
}

float slowscan(vec2 uv) {
	return sin(u_resolution.y * uv.y * 0.02 + u_time * 6.0);
}

vec2 colorShift(vec2 uv) {
	return vec2(uv.x, uv.y + sin(u_time) * 0.02);
}

vec2 colorshift(vec2 uv, float amount, float rand) {
	return vec2(uv.x, uv.y + amount * rand * sin(uv.y * u_resolution.y * 0.12 + u_time));
}

vec2 scandistort(vec2 uv) {
	float scan1 = clamp(cos(uv.y * 2.0 + u_time), 0.0, 1.0);
	float scan2 = clamp(cos(uv.y * 2.0 + u_time + 4.0) * 10.0, 0.0, 1.0) ;
	float amount = scan1 * scan2 * uv.x;

	float noise = hash12(vec2(uv.x, amount));
	vec4 noiseTexture = vec4(vec3(noise), 1.0);
	
	uv.x -= 0.05 * mix(noiseTexture.r * amount, amount, 0.9);

	return uv;	 
}

vec3 thermal_vision(in vec3 color) {
    vec3 colors[3];
    colors[0] = u_color_1;
    colors[1] = u_color_2;
    colors[2] = u_color_3;

	// luminosity factor
	float factor = 1.3;

    float luminance = dot(vec3(0.40, 0.38, 0.25), color * factor);

    if(luminance < 0.5) {
    	color = mix(colors[0], colors[1], luminance / 0.5);
    } else {
    	color = mix(colors[1], colors[2], (luminance - 0.5) / 0.5);   
    }

    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{   
	vec2 uv = v_uv;
	vec4 color = texture2D(u_stream, uv);
	color.rgb = thermal_vision(color.rgb);

	vec2 sd_uv = scandistort(uv);
	vec2 crt_uv = crt(sd_uv, 2.0);

	float n = hash12(vec2(u_time * 0.01, u_time * 0.02));
	vec4 rand = vec4(vec3(n), 1.0);

	color.r = texture2D(u_stream, crt(colorshift(sd_uv, 0.025, rand.r), 2.0)).r;
	color.g = texture2D(u_stream, crt(colorshift(sd_uv, 0.01, rand.g), 2.0)).g;
	color.b = texture2D(u_stream, crt(colorshift(sd_uv, 0.024, rand.b), 2.0)).b;	

	vec3 scanline_color = vec3(scanline(crt_uv));
	vec3 slowscan_color = vec3(slowscan(crt_uv));

	fragColor.rgb = mix(color.rgb, mix(scanline_color, slowscan_color, 0.5), 0.05) * noise(uv);
    
    fragColor = vec4(thermal_vision(fragColor.rgb), 1.0);
}

void main() {
	mainImage(gl_FragColor, gl_FragCoord.xy);
}