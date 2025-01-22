const vs = /* glsl */`#version 300 es
in vec4 a_position; void main() {
    gl_Position = a_position;
}
`;

const fs = /* glsl */`#version 300 es
precision highp float;

out vec4 outColor;

void main() {
    outColor = vec4(0.7, 0, 0.5, 1);
}
`;

export { vs, fs }
