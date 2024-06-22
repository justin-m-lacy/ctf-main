
#define PI 3.1415926535897932384626433832795
precision highp float;

uniform sampler2D uSampler;

in vec2 vTextureCoord;

in vec2 vertPos;
uniform vec4 inputClamp;
uniform float cutHeight;

in float pctTime;

in vec2 cutAxis;

in vec2 slideUV;

out vec4 color;

void main(void)
{
	
	float cutDist=(vertPos.y*cutAxis.x-vertPos.x*cutAxis.y)/cutHeight;
	
	float direction=2.*(mod(floor(cutDist),2.)-.5);
	
	vec2 coord=vTextureCoord+direction*slideUV;
	vec2 alphas=step(inputClamp.xy,coord)*step(coord,inputClamp.zw);
	
	/// nearness to edge.
	float edgePct=2.*abs(fract(cutDist)-.5);
	// smoothing plus darken edges. darken over time.
	edgePct=1.-.2*smoothstep(.6,1.,edgePct)*min(8.*pctTime,1.);
	
	color=min(alphas.x,alphas.y)*texture(uSampler,coord)*vec4(edgePct,edgePct,edgePct,1.);
}