#version 450

layout(binding=0) uniform Proj {
    mat4 proj;
};
layout(binding=1) uniform Entity {
    mat4 world;
} entities[2];

layout(location=0) in vec3 inPos;

void main() {
    gl_Position = vec4(inPos, 1.0) * entities[gl_InstanceIndex].world * proj;
}
