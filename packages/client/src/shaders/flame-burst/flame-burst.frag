#define PI 3.1415926535897932384626433832795
precision highp float;

uniform vec3 colors1[2];
uniform vec3 colors2[2];
uniform int seed;
uniform float maxRadius;
uniform float time;

uniform sampler2D uSampler;

in vec2 vTextureCoord;

/// world vertex position.
in vec2 axisPos;

/// circle expanding position.
//in vec2 circle;

in float rMax;
in float rMin;

in float perlinOffset;

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
	
	return.5*f;
}

void main(void)
{
	vec4 tex=texture(uSampler,vTextureCoord);
	
	// current radius.
	float len=length(axisPos);
	vec2 dir=axisPos/len;
	
	float perlinV=fbm((axisPos+perlinOffset*vec2(dir.x,dir.y))/maxRadius,4);
	
	vec2 offsetPos=axisPos+dir*36.*vec2(perlinV,perlinV);
	
	float d1=length(offsetPos);
	
	if(d1>rMax){
		color=tex;
	}else{
		
		/// pow() increases fadeoff
		float alpha1=pow(1.-smoothstep(0.,rMax,d1),1.5);
		
		alpha1*=distance(offsetPos,axisPos)/10.;
		
		float radialPerlin=fbm((offsetPos/maxRadius)*(2.*cos(perlinOffset)),4);
		//perlin shading
		alpha1=alpha1*8.4*(radialPerlin+.5);
		
		// interior cutoff.
		alpha1*=smoothstep(.2*rMin+32.*radialPerlin+48.*time,.3*rMin+32.*radialPerlin+48.*time,d1)*(1.-smoothstep(0.,max(rMax-32.*time,0.),d1));
		// cutoff small alpha.
		alpha1*=smoothstep(.3,1.,alpha1);
		//alpha *= (1.-smoothstep(min(),max(2.*rMax-44.*time,.0),d1));
		
		// exponential alpha
		//alpha1*=pow(2.,-4.*time*smoothstep(.3,1.,time));
		
		vec4 flame1=vec4(
			alpha1,
			pow(alpha1,2.9),
			0.,
		alpha1);
		
		color=flame1+(1.-flame1.a)*tex;
		
	}
}