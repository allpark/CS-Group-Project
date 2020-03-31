#ifdef GL_ES
	precision mediump float;
	precision mediump int;
#endif


uniform sampler2D texture;
varying vec2 uv;			
		
uniform sampler2D rt0;
uniform sampler2D rt1;




void main() {
	
	vec2 uvFlipped = vec2(uv.x, 1.0 - uv.y);
        
	vec4 rt0Texel = texture2D(rt0, uvFlipped);
    
    
	float rt1r = texture2D(rt1, uvFlipped).r;
    vec2 rt1gb = texture2D(rt1, uvFlipped * 0.998).gb;

	gl_FragColor = vec4(rt0Texel.rgb + vec3(rt1r, rt1gb), 1.0);                
	
}


