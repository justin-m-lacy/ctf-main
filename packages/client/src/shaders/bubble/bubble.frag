#define PI 3.1415926535897932384626433832795
precision mediump float;

// perlin seed
uniform int seed;
uniform vec3 color1;
uniform vec3 color2;
uniform float radius;
uniform sampler2D uSampler;
uniform bool knockout;

/// alpha of effect separate from tex.
uniform float alpha;
uniform float time;

// offset for perlin samples.
//in vec2 offset;
in vec2 vTextureCoord;

in vec2 pt1;
in vec2 pt2;
in vec2 pt3;

// vertPos divided by radius in each dimension.
// not normalized.
in vec2 vertR;

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

/// octaves: number of subdivisions. each octave halves the granularity.
float perlin(vec2 uv,int octaves){
	
	float f=0.;
	float r=.5;
	
	/// translates to new sample location for octaves.
	mat2 m=mat2(1.6,1.2,-1.2,1.6);
	
	uv*=float(1<<(octaves-1));
	
	for(int i=octaves;i>0;i--){
		f+=r*noise(uv);uv=m*uv;
		r=.5*r;
	}
	
	return f;
}

/// step but preserves the original value.
float cutoff(float min,float v){
	return v*step(min,v);
}

void main(void)
{
	vec4 tex=knockout?vec4(0.):texture(uSampler,vTextureCoord);
	
	float r=length(vertR);
	
	if(r>1.05){
		color=tex;
	}else{
		
		float z=sqrt(1.-length(vertR*vertR));
		
		/// smooth edge at drop>1
		float alpha1=r>1.?1.-smoothstep(1.,1.06,r):pow(r,4.);
		alpha1*=.77;
		
		/// Edge circle with wavy interior:
		//alpha1*=.65+.5*perlin(vertR+.6*offset,4);
		//alpha1=cutoff(.3,alpha1);
		
		///psuedo displacement filter = 1-z
		float del=perlin(vertR*(1.+.4*(1.-z))+time*.01,3);
		
		// distance to lightning
		float d1=abs(4.*del)*min(length(cross(vec3(vertR-pt1,0.),vec3(1.,1.,1.))),.98);
		//d1=max(d1,.03);
		
		float d2=abs(4.*del)*min(length(cross(vec3(vertR-pt2,0.),vec3(1.,1.,1.))),.98);
		//d2=max(d2,.03);
		
		d1=min(d1,d2);
		
		float alpha2=mix(.0,1.,1.-min(d1/.2,1.));
		//alpha2*=cutoff(.4,.5+.5*perlin(vertR,4));
		
		vec4 bubble=alpha1*vec4(color1,1.);
		vec4 shock=alpha2*vec4(color2,1.);
		
		color=bubble.a>0.?alpha*bubble.a*bubble+(1.-bubble.a)*tex+alpha*shock:tex;
		
	}
	
}