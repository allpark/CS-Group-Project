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
	vec4 rt1Texel = texture2D(rt1, uvFlipped);
	
	gl_FragColor = vec4(rt0Texel.rgb + rt1Texel.rgb,1.0);                
	
}


