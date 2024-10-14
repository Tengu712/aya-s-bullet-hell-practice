#version 450

layout(binding=0) uniform Projection {
    mat4 data;
} proj;

layout(location=0) in vec3 inPos;

void main() {
    gl_Position = vec4(inPos, 1.0) * proj.data;
}
