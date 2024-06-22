#define PI 3.1415926535897932384626433832795
precision mediump float;

// perlin seed
uniform int seed;
uniform float xLen;
uniform float yLen;

uniform sampler2D uSampler;

uniform float time;

// offset for perlin samples.
in vec2 offset;
in vec2 vTextureCoord;

/// world vertex position.
in vec2 axisPos;

// max x,y positions
in vec2 maxPos;

out vec4 color;

vec2 grad(ivec2 z)// replace this anything that returns a random vector
{
	// 2D to 1D  (feel free to replace by some other)
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
	
	vec2 u=f*f*(3.-2.*f);// feel free to replace by a quintic smoothstep instead
	
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
	
	return.5+.5*f;
}

/// step but preserves the original value.
float cutoff(float min,float v){
	return v*step(min,v);
}

void main(void)
{
	vec4 tex=texture(uSampler,vTextureCoord);
	
	float perlinV=fbm(axisPos/yLen+offset,4);
	vec2 offsetPos=axisPos+16.*(perlinV-.5);
	offsetPos+=vec2(-4.*abs(cos(time+axisPos.y/yLen)),0.);
	
	if(offsetPos.x<0.){
		color=tex;
	}else{
		
		float coneAlpha=1.-smoothstep(.5,maxPos.y,abs(offsetPos.y));
		
		coneAlpha=1.2*pow(coneAlpha,2.1);
		
		/// x falloff.
		coneAlpha*=1.-smoothstep(.92*maxPos.x,maxPos.x,offsetPos.x+20.*(perlinV-.5));
		
		//interior chaos
		float alpha1=coneAlpha*(1.5*fbm(axisPos/xLen+offset,4))*2.2*abs(perlinV);
		
		vec4 flame1=vec4(
			alpha1,
			pow(alpha1,3.1),0.,alpha1);
			
			color=flame1+(1.-alpha1)*tex;
			
		}
	}