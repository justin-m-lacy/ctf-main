in vec2 aVertexPosition;

uniform bool loop;

uniform vec4 outputFrame;

uniform mat3 projectionMatrix;

// total time of effect.
uniform float effectTime;
uniform float time;
uniform float angle;

/// position of container.
uniform vec2 worldPos;

/**
inputSize.xy is the size of filter area in pixels,
*/
uniform vec4 inputSize;

/// vTextureCoord is NOT the clip texture coordinate.
///
out vec2 vTextureCoord;

out vec2 vertPos;

out vec2 cutAxis;

/// slide distance.
out vec2 slideUV;

out float pctTime;

vec2 filterTextureCoord(void)
{
    
    return aVertexPosition*(outputFrame.zw*inputSize.zw);
}

void main(void)
{
    vec2 screenPos=aVertexPosition*outputFrame.zw+outputFrame.xy;
    
    gl_Position=vec4((projectionMatrix*vec3(screenPos,1.)).xy,0.,1.);
    
    vertPos=screenPos-worldPos;
    
    vTextureCoord=filterTextureCoord();
    
    cutAxis=vec2(cos(angle),sin(angle));
    
    pctTime=loop?fract(time/effectTime):clamp(time/effectTime,0.,1.);
    
    slideUV=pctTime*vec2(cutAxis.x,cutAxis.y*(inputSize.x/inputSize.y));
    
}