#ifdef GL_ES
	precision mediump float;
	precision mediump int;
#endif


uniform sampler2D texture;
varying vec2 uv;			
			
uniform sampler2D basemap;
uniform sampler2D basemap_nocaps;

uniform sampler2D heightmap;
uniform sampler2D ramptex;
uniform sampler2D warningtex;

// assuming linear encoding, this specifies the range of values that height texels represent 
uniform float elevationrange;

// current sea level  
uniform float sealevel;

// ice cap alpha
uniform float capalpha;

// render mode 
uniform float mode;

// ramp range 
uniform float ramprange;

#define seacolor vec3(0.0, 0.37254902, 0.6)

float decodeHeight(float height, float range){
	return height * range;
}

float encodeHeight(float elevation, float range){
	return elevation/range;
}

float getInterpolatedSeaLevelAlpha(float sealevel, float elevation, float range){

	float elevationPerLum = range / 255.0;
	
	float lowerBound = floor(sealevel/elevationPerLum) * elevationPerLum;
	float upperBound = floor(sealevel/elevationPerLum) * elevationPerLum;

	return abs(elevation - sealevel) >= elevationPerLum ? 1.0 : ( (sealevel - lowerBound) / elevationPerLum);

}
vec3 flood(vec3 base, float height, vec2 uv){
	
	// elevation related parameters 
	float elevationAtTexel = decodeHeight(height, elevationrange);
	float seaLevelAlpha    = getInterpolatedSeaLevelAlpha(sealevel, elevationAtTexel, elevationrange);
	float elevationDiff    = elevationAtTexel - sealevel;
	
	// calculate ramped color
	// get ocean mask    
	float rampAlpha        = min( -elevationDiff / ramprange, 1.0);
	vec3 rampc             = texture2D(ramptex, vec2(rampAlpha, 0.0)).rgb;
	
	float endangeredPixels = -elevationDiff >= 0.0 ? 1.0 : 0.0 ;
	
	// calculate sea overlay color 
	vec3 finalOverlayColor = mix(seacolor, rampc, mode);
	
	vec3 endangeredTexMap  = texture2D(warningtex, mod(uv *  5.0, 1.0)).rgb;
	// calculate final shaded look
	vec3 shaded = mix(base, finalOverlayColor, elevationDiff <= 0.0 ? seaLevelAlpha * 0.5 : 0.0);
	//vec3 shaded = mix(base, endangeredTexMap, endangeredPixels);

	
	return shaded;
}
void main() {
	
	// flip uv 
	vec2 uv      = vec2(uv.x, 1.0 - uv.y);
	
	// get texel values of each map 
	vec3 base       = texture2D(basemap, uv).rgb;
	vec3 basenocaps = texture2D(basemap_nocaps, uv).rgb;
	
	// lerp base to base no caps given alpha values
	
	base = mix(base, basenocaps, capalpha);
	
	float height = texture2D(heightmap, uv).r;

	// initialize output texel
	vec3 flooded  = flood(base, height, uv);
	
	

	
	gl_FragColor = vec4(flooded, 1.0);                
	
}


