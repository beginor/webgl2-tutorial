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
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
        const colorLocation = gl.getUniformLocation(program, 'u_color');

        const positionBuffer = gl.createBuffer();


        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttrLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

        for (let i = 0; i < 50; ++i) {
            this.setRectangle(
                gl,
                this.randomInt(300),
                this.randomInt(300),
                this.randomInt(300),
                this.randomInt(300)
            );
            gl.uniform4f(
                colorLocation,
                Math.random(),
                Math.random(),
                Math.random(),
                1
            );
            const primitiveType = gl.TRIANGLES;
            const offset = 0;
            const count = 6;
            gl.drawArrays(primitiveType, offset, count);
        }
    }

    private randomInt(range: number): number {
        return Math.floor(Math.random() * range);
    }

    private setRectangle(
        gl: WebGL2RenderingContext,
        x: number,
        y: number,
        width: number,
        height: number
    ): void {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                x1, y1,
                x2, y1,
                x1, y2,
                x1, y2,
                x2, y1,
                x2, y2,
            ]),
            gl.STATIC_DRAW
        );
    }

}

