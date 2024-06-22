precision mediump float;

uniform vec4 outputFrame;

uniform mat3 projectionMatrix;

uniform vec2 localPos;
uniform float time;
uniform float angle;
uniform float radius;

/**
inputSize.xy is the size of filter area in pixels,
*/
uniform vec4 inputSize;

in vec2 aVertexPosition;

/// vTextureCoord is NOT the clip texture coordinate.
///
out vec2 vTextureCoord;

out vec2 vertR;


out vec2 pt1;
out vec2 pt2;


vec4 filterVertexPosition(void)
{
    /// Map aVertexPosition to outputFrame.
    vec2 position=aVertexPosition*max(outputFrame.zw,vec2(0.))+outputFrame.xy;
    
    /// Projection goes from screen pixel position BACK to clip space,
    /// probably to allow for culling?
    return vec4((projectionMatrix*vec3(position,1.)).xy,0.,1.);
}

/**
This cannot be accurate as a texture coordinate, yet works for
uniform sampler2D uSampler;
provided to fragment shader.
**/
vec2 filterTextureCoord(void)
{
    /// (outputFrame.zw*inputSize.zw) => percent of total input texture used.
    /// aVertexPosition ranges from 0 to 1 always but only some of this contains clip.
    /// Shrinking aVertexPos limits sampling the input texture to parts
    /// actually used.
    /// Leaving out the multiplication means the sampled texture will always fill the full
    /// 2^n input texture.
    return aVertexPosition*(outputFrame.zw*inputSize.zw);
}

void main(void)
{
    /// CLIP SPACE VERTEX POSITION.
    gl_Position=filterVertexPosition();
    
    float t=.07*time;
    
    float theta1=.05*t;
    float theta2=3.14+.05*t;
    
    pt1=vec2(cos(theta1),sin(theta1));
    pt2=vec2(cos(theta2),sin(theta2));
    
    vec2 axis=vec2(1.,0.);//vec2(cos(angle+.01*t),sin(angle+.01*t));
    
    vTextureCoord=filterTextureCoord();
    
    // frag local coordinate, including rotation.
    vec2 pos=(aVertexPosition*outputFrame.zw+outputFrame.xy-localPos);
    pos=vec2(dot(axis,pos),pos.x*axis.y-pos.y*axis.x);
    
    //offset=vec2(2.4*t,t);
    
    //float R=radius*(1.-.02*abs(cos(t)));
    vertR=(pos)/radius;
}