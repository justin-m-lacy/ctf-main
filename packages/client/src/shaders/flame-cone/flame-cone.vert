precision mediump float;

uniform vec4 outputFrame;

uniform mat3 projectionMatrix;

uniform vec2 worldPos;
uniform float xLen,yLen;
uniform float time;
uniform float angle;

uniform float growTime;

/**
inputSize.xy is the size of filter area in pixels,
*/
uniform vec4 inputSize;

in vec2 aVertexPosition;

out vec2 vTextureCoord;

// pos along main axis.
out vec2 axisPos;

out vec2 offset;

out vec2 maxPos;

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
    
    float t=.2*time;
    vec2 axis=vec2(cos(angle),sin(angle));
    
    vTextureCoord=filterTextureCoord();
    
    // delta to center, pre-rotation.
    vec2 del=aVertexPosition*outputFrame.zw+outputFrame.xy-worldPos;
    axisPos=vec2(dot(axis,del),del.y*axis.x-del.x*axis.y);
    
    float pctTime=min(time/max(.001,growTime),1.);
    
    maxPos=vec2(xLen*(1.-pow(1.-pctTime,2.2)),(axisPos.x+16.)*(yLen/xLen));
    
    // large Asin-Bcos produces swirling
    offset=vec2(-4.*t,0.);
}