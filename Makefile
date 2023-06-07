.PHONY: glslc

glslc: ./src/shader.frag ./src/shader.vert
	glslc -o ./shader.frag.spv ./src/shader.frag
	glslc -o ./shader.vert.spv ./src/shader.vert
