// Get the position attribute of the geometry
attribute vec3 aPosition;

// Get the texture coordinate attribute from the geometry
attribute vec2 aTexCoord;

// Get the normal attribute from the geometry
attribute vec3 aNormal;


uniform mat4 uProjectionMatrix;

uniform mat4 uModelViewMatrix;

varying vec2 uv;
varying vec3 normal;

void main() {

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  normal = aNormal;
  
  // Move our vertex positions into screen space
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

  // Send the texture coordinates to the fragment shader
  uv = aTexCoord;

  
}