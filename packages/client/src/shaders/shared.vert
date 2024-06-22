in vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform vec4 inputSize;
uniform vec4 outputFrame;

out vec2 vTextureCoord;
out vec2 vTexPos;

vec4 filterVertexPosition(void)
{
    vec2 position=aVertexPosition*outputFrame.zw+outputFrame.xy;
    
    return vec4((projectionMatrix*vec3(position,1.)).xy,0.,1.);
}

void main(void)
{
    gl_Position=filterVertexPosition();
    vTextureCoord=aVertexPosition*(outputFrame.zw*inputSize.zw);
    vTexPos=aVertexPosition*(outputFrame.zw);
    
}