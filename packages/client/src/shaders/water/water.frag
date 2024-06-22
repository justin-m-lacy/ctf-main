#define PI 3.1415926535897932384626433832795

precision mediump float;

uniform sampler2D uSampler;
uniform sampler2D maskTex;
uniform vec3 tint;

uniform int seed;
uniform float alpha;
uniform float amp;
// angular freq.
uniform float freq;
uniform highp float time;

uniform highp vec4 inputSize;
uniform vec4 inputClamp;

in vec2 maskScale;
in vec2 vMaskCoord;
in vec2 vTextureCoord;
in vec2 axisPos;

out vec4 color;

const float MaxEdge=.05;

vec2 grad(ivec2 z)
{
	// 2D to 1D
	int n=z.x+z.y*seed;
	
	// Hugo Elias hash (feel free to replace by another one)
	n=(n<<13)^n;
	n=(n*(n*n*15731+789221)+1376312589)>>16;
	
	// Perlin style vectors
	n&=7;
	vec2 gr=vec2(n&1,n>>1)*2.-1.;
	return(n>=6)?vec2(0.,gr.x):
	(n>=4)?vec2(gr.x,0.):
	gr;
	
}

float noise(in vec2 p)
{
	ivec2 i=ivec2(floor(p));
	vec2 f=fract(p);
	
	vec2 u=f*f*(3.-2.*f);
	
	return mix(mix(dot(grad(i+ivec2(0,0)),f-vec2(0.,0.)),
	dot(grad(i+ivec2(1,0)),f-vec2(1.,0.)),u.x),
	mix(dot(grad(i+ivec2(0,1)),f-vec2(0.,1.)),
	dot(grad(i+ivec2(1,1)),f-vec2(1.,1.)),u.x),u.y);
}

/// octaves: # of subdivisions. each octave halves granularity.
float fbm(vec2 uv,int octaves){
	
	float f=0.;
	float r=.5;
	
	/// translates to new sample location for octaves.
	mat2 m=mat2(1.6,1.2,-1.2,1.6);
	
	uv*=float(1<<(octaves-1));
	
	for(int i=octaves;i>0;i--){
		f+=r*noise(uv);uv=m*uv;
		r=.5*r;
	}
	
	return.5*f;
}

/// step but preserve original value.
float cutoff(float min,float v){
	return v*step(min,v);
}

/// step but preserve original value.
vec2 cutoff(float min,vec2 v){
	return v*step(min,v);
}

vec4 colorTint(vec4 orig,vec4 col,float t){
	return(1.-t)*orig+t*col;
}

float sawtooth(float x,float lambda){
	return 2.*(mod((x),lambda)-.5*lambda)/lambda;
	
}

void main(void)
{
	
	vec2 displace=amp*vec2(
		-sin(axisPos.y*freq+time)*cos(axisPos.x*freq+time),
		-sin(axisPos.x*freq+time)*cos(axisPos.y*freq+time)
	)*inputSize.zw;
	
	// displace mask too. use this for mask coords.
	//vec2 maskCoord=vMaskCoord+displace*maskScale;
	
	vec4 inMask=texture(maskTex,vMaskCoord.xy);
	
	vec2 edge=vec2(min(vMaskCoord.x,1.-vMaskCoord.x),min(vMaskCoord.y,1.-vMaskCoord.y));
	
	// dist to edge
	float edgeD=min(edge.x,edge.y);
	
	/// TODO: cutoffs should be in REAL PIXEL distances.
	
	float outA=alpha*inMask.a;
	if(edgeD<=0.){
		displace*=0.;
		outA=0.;
		
	}
	else if(edgeD<MaxEdge){
		
		// cutoff x,y if axis too far.
		edge=cutoff(0.,MaxEdge-edge);
		edge*=length(edge)/MaxEdge;
		
		displace=vec2(sign(vMaskCoord.x-.5),sign(vMaskCoord.y-.5))*edge;
		
	}
	
	inMask.xyz=inMask.xyz-.2*inMask.xyz*(1.-smoothstep(0.,.15,edgeD));
	
	vec4 tex=texture(uSampler,clamp(vTextureCoord.xy+displace,inputClamp.xy,inputClamp.zw));
	
	//color=outA*vec4(tint,1.)+(1.-outA)*tex;
	color=outA*inMask+(1.-outA)*tex;
	
}