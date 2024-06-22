uniform vec4 outputFrame;

uniform mat3 projectionMatrix;

uniform float time;

uniform mat3 maskMatrix;

uniform vec2 worldPos;

/**
size of filter area in pixels,
zw is inverse.
*/
uniform vec4 inputSize;

in vec2 aVertexPosition;

out vec2 vTextureCoord;
out vec2 vMaskCoord;
out vec2 axisPos;
out vec2 maskScale;

vec4 filterVertexPosition(void)
{
    /// aVertexPosition to outputFrame.
    vec2 position=aVertexPosition*max(outputFrame.zw,vec2(0.))+outputFrame.xy;
    
    return vec4((projectionMatrix*vec3(position,1.)).xy,0.,1.);
}

vec2 filterTextureCoord(void)
{
    return aVertexPosition*(outputFrame.zw*inputSize.zw);
}

void main(void)
{
    /// CLIP SPACE VERTEX POSITION.
    gl_Position=filterVertexPosition();
    
    float angle=0.;
    
    //vec2 axis=vec2(cos(time*3.14/5.),sin(time*3.14/5.));
    vec2 axis=vec2(cos(angle),sin(angle));
    
    vTextureCoord=filterTextureCoord();
    
    vec2 del=-(aVertexPosition*outputFrame.zw+outputFrame.xy-worldPos);
    axisPos=vec2(dot(axis,del),del.x*axis.y-del.y*axis.x);
    
    maskScale=(maskMatrix*vec3(1.,1.,1.)).xy;
    
    vMaskCoord=(maskMatrix*vec3(vTextureCoord,1.)).xy;
    
}