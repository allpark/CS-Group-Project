#ifdef GL_ES
	precision mediump float;
	precision mediump int;
#endif


varying vec2 uv;		
varying vec3 normal;

uniform float time;

vec2 rotate( in vec2 uv, float a)
{
    float c = cos( a );
    float s = sin( a );
    return vec2( c * uv.x - s * uv.y, s * uv.x + c * uv.y );
}

float hash( float n ) { return fract(sin(n)*123.456789); }

float noise( in vec3 p )
{
    vec3 fl = floor( p );
    vec3 fr = fract( p );
    fr = fr * fr * ( 3.0 - 2.0 * fr );
	
    float n = fl.x + fl.y * 157.0 + 113.0 * fl.z;
    return mix( mix( mix( hash( n +   0.0), hash( n +   1.0 ), fr.x ),
                     mix( hash( n + 157.0), hash( n + 158.0 ), fr.x ), fr.y ),
                mix( mix( hash( n + 113.0), hash( n + 114.0 ), fr.x ),
                     mix( hash( n + 270.0), hash( n + 271.0 ), fr.x ), fr.y ), fr.z);
}

float fbm( in vec2 p, float t )
{
    float f;
    f  = 0.5000 * noise( vec3( p, t ) ); p *= 2.1;
    f += 0.2500 * noise( vec3( p, t ) ); p *= 2.2;
    f += 0.1250 * noise( vec3( p, t ) ); p *= 2.3;
    f += 0.0625 * noise( vec3( p, t ) );
    return f;
}


vec4 getStars( in vec3 dir, float time )
{
    vec3 n  = abs( dir );
    vec2 uv = ( n.x > n.y && n.x > n.z ) ? dir.yz / dir.x: 
              ( n.y > n.x && n.y > n.z ) ? dir.zx / dir.y:
                                           dir.xy / dir.z;
    
    float f = 0.0;
    
    for( int i = 0 ; i < 5; ++i )
    {
        uv = rotate( 1.07 * uv + vec2( 0.7 ), 0.5 );
        
        float t = 10. * uv.x * uv.y + time;
        vec2 u = cos( 100. * uv ) * fbm( 10. * uv, 0.0 );
        f += smoothstep( 0.5, 0.55, u.x * u.y ) * ( 0.25 * sin( t ) + 0.75 );
    }
    
    return vec4(vec3(1.0), f);
}


void main() {	


	gl_FragColor = vec4(getStars(normal, time));                
	
}
