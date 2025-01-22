import * as utils from './resources/webgl-utils';
import * as m3 from './resources/m3';
import * as ui from './resources/webgl-lessons-ui';

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

        const uiContainer = document.createElement('div');
        uiContainer.setAttribute('id', 'uiContainer');
        this.container.appendChild(uiContainer);
        uiContainer.innerHTML = `<div id="ui">
                <div id="x"></div>
                <div id="y"></div>
                <div id="angle"></div>
                <div id="scaleX"></div>
                <div id="scaleY"></div>
            </div>`;

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            throw new Error('WebGL2 not supported');
        }

        const program = utils.createProgramFromSources(gl, [vs, fs]);

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        const colorLocation = gl.getAttribLocation(program, 'a_color');
        const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

        // set positions;
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        setGeometry(gl);

        gl.enableVertexAttribArray(positionLocation);

        const posSize = 2;
        const posType = gl.FLOAT;
        const posNormalize = false;
        const posStride = 0;
        const posOffset = 0;
        gl.vertexAttribPointer(
            positionLocation,
            posSize,
            posType,
            posNormalize,
            posStride,
            posOffset
        );

        // set colors
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        setColors(gl);
        gl.enableVertexAttribArray(colorLocation);
        const colorSize = 4;
        const colorType = gl.FLOAT;
        const colorNormalize = false;
        const colorStride = 0;
        const colorOffset = 0;
        gl.vertexAttribPointer(
            colorLocation,
            colorSize,
            colorType,
            colorNormalize,
            colorStride,
            colorOffset
        );


        const translation = [200, 150];
        let angleInRadians = 0;
        const scale = [1, 1];

        drawScene();

        ui.setupSlider('#x', { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
        ui.setupSlider('#y', { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
        ui.setupSlider('#angle',  { slide: updateAngle, max: 360});
        ui.setupSlider('#scaleX', { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
        ui.setupSlider('#scaleY', { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

        function updatePosition(index: number) {
            return function (evt: Event, ui: { value: number; }) {
                translation[index] = ui.value;
                drawScene();
            };
        }

        function updateAngle(event: Event, ui: { value: number; }): void {
            const angleInDegrees = 360 - ui.value;
            angleInRadians = angleInDegrees * Math.PI / 180;
            drawScene();
        }

        function updateScale(index: number) {
            return function (event: Event, ui: { value: number; }) {
                scale[index] = ui.value;
                drawScene();
            };
        }

        function drawScene(): void {
            if (!gl) {
                return;
            }
            const canvas = gl.canvas as HTMLCanvasElement;
            utils.resizeCanvasToDisplaySize(canvas);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            let matrix = m3.projection(
                canvas.clientWidth,
                canvas.clientHeight
            );
            matrix = m3.translate(matrix, translation[0], translation[1]);
            matrix = m3.rotate(matrix, angleInRadians);
            matrix = m3.scale(matrix, scale[0], scale[1]);

            gl.useProgram(program);
            gl.bindVertexArray(vao);
            gl.uniformMatrix3fv(matrixLocation, false, matrix);

            const offset = 0;
            const count = 6;
            gl.drawArrays(gl.TRIANGLES, offset, count);
        }

        function setGeometry(gl: WebGL2RenderingContext): void {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    -150, -100,
                    150, -100,
                    -150,  100,
                    150, -100,
                    -150,  100,
                    150,  100,
                ]),
                gl.STATIC_DRAW
            );
        }

        function setColors(gl: WebGL2RenderingContext): void {
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    Math.random(), Math.random(), Math.random(), 1,
                    Math.random(), Math.random(), Math.random(), 1,
                    Math.random(), Math.random(), Math.random(), 1,
                    Math.random(), Math.random(), Math.random(), 1,
                    Math.random(), Math.random(), Math.random(), 1,
                    Math.random(), Math.random(), Math.random(), 1,
                ]),
                gl.STATIC_DRAW
            );
        }

    }

}

