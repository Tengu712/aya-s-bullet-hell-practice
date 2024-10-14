#version 450

layout(binding=0) uniform Proj {
    mat4 proj;
};
layout(binding=1) uniform Entity {
    mat4 world;
    vec4 uv;
    vec4 color;
    vec4 dummy1;
    vec4 dummy2;
} entities[2];

layout(location=0) in vec3 inPos;

layout(location=0) out vec4 outColor;

void main() {
    gl_Position = vec4(inPos, 1.0) * entities[gl_InstanceIndex].world * proj;
    outColor = entities[gl_InstanceIndex].color;
}
