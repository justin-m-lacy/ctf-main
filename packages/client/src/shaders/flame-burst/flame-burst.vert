uniform vec4 outputFrame;

uniform mat3 projectionMatrix;

uniform vec2 worldPos;

uniform float time;
uniform float totalTime;
uniform float angle;

uniform float minRadius;
uniform float maxRadius;

uniform bool loop;

/**
inputSize.xy is the size of filter area in pixels,
*/
uniform vec4 inputSize;

in vec2 aVertexPosition;

/// vTextureCoord is NOT the clip texture coordinate.
///
out vec2 vTextureCoord;

out vec2 axisPos;

out float rMin;
out float rMax;

out float perlinOffset;

vec4 filterVertexPosition(void)
{
    /// Map aVertexPosition to outputFrame.
    vec2 position=aVertexPosition*max(outputFrame.zw,vec2(0.))+outputFrame.xy;
    
    /// Projection goes from screen pixel position BACK to clip space,
    /// probably to allow for culling?
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
    
    float t=loop?mod(time,totalTime):clamp(0.,totalTime,time);
    
    /// 2^-t, t to totalTime
    float kpow=pow(2.,5.*totalTime);
    t=kpow*(1.-pow(2.,-5.*t))/(kpow-1.);
    
    //
    //t=2.-pow(2.,1.-t/totalTime);
    
    // 1/x modified
    //t=(1.-.4/(t/totalTime+.4))/(1.-.4/(1.+.4));
    
    vec2 axis=vec2(cos(angle),sin(angle));
    
    vTextureCoord=filterTextureCoord();
    vec2 offset=(aVertexPosition*outputFrame.zw+outputFrame.xy-worldPos);
    axisPos=vec2(dot(axis,offset),offset.x*axis.y-offset.y*axis.x);
    
    rMin=(1.-t)*minRadius+t*1.05*maxRadius;
    rMax=(1.-t)*minRadius+t*maxRadius;
    
    perlinOffset=-time;
    
}