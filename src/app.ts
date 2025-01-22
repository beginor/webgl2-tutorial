import * as glUtils from './webgl-utils'

import { vs, fs } from './hello';

import './app.css';

export class App {

    /** app title */
    public title = 'Hello, WebGL2 !';

    constructor(private container: HTMLElement) { }

    /**
     * run the app.
     */
    public run(): void {
        const canvas = document.createElement('canvas');
        canvas.classList.add('app');
        this.container.appendChild(canvas);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 not supported');
        }

        const program = glUtils.createProgramFromSources(gl, vs, fs);

        const positionAttrLoc = gl.getAttribLocation(program, 'a_position');
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            10, 20,
            80, 20,
            10, 30,
            10, 30,
            80, 20,
            80, 30,
        ];
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(positions),
            gl.STATIC_DRAW
        );

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttrLoc);

        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

        const size = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.vertexAttribPointer(
            positionAttrLoc,
            size,
            type,
            normalize,
            stride,
            offset
        );

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.uniform2f(
            resolutionUniformLocation,
            gl.canvas.width,
            gl.canvas.height
        );

        const primitiveType = gl.TRIANGLES;
        const count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

}

