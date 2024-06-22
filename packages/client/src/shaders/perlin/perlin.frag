in vec2 vTextureCoord;
in vec2 vTexPos;

out vec4 color;

uniform int seed;
uniform sampler2D uSampler;
uniform vec2 size;
uniform float perlinOffset;
//uniform vec4 colorOffset;

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

void main(void)
{
    vec2 uv=(size-abs(mod(vTexPos,2.*size)-size))/size;
    
    float f=0.;
    
    uv*=8.;
    mat2 m=mat2(1.6,1.2,-1.2,1.6);
    f=.5000*noise(uv);uv=m*uv;
    f+=.2500*noise(uv);uv=m*uv;
    f+=.1250*noise(uv);uv=m*uv;
    f+=.0625*noise(uv);uv=m*uv;
    
    f=.5+.5*f+perlinOffset;
    //color = vec4( f,f,f, 1.0 );
    //color = vec4( vTexPos, 0.0, 1.0);
    color=texture(uSampler,vTextureCoord)*vec4(1.,1.,1.,f);
}