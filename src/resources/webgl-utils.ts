const errorRE = /ERROR:\s*\d+:(\d+)/gi;

function error(msg: string): void {
    console.error(msg);
}

function addLineNumbersWithError(src: string, log = ''): string {
    // Note: Error message formats are not defined by any spec so this may or may not work.
    const matches = [...log.matchAll(errorRE)];
    const lineNoToErrorMap = new Map(matches.map((m, ndx) => {
        const lineNo = parseInt(m[1]);
        const next = matches[ndx + 1];
        const end = next ? next.index : log.length;
        const msg = log.substring(m.index, end);
        return [lineNo - 1, msg];
    }));
    return src.split('\n').map((line, lineNo) => {
        const err = lineNoToErrorMap.get(lineNo);
        return `${lineNo + 1}: ${line}${err ? `\n\n^^^ ${err}` : ''}`;
    }).join('\n');
}


/**
 * Error Callback
 */
type ErrorCallback = (msg: string) => void;

/**
 * Loads a shader.
 */
export function loadShader(
    gl: WebGLRenderingContext,
    shaderSource: string,
    shaderType: number,
    errorCallback?: ErrorCallback
): WebGLShader | null {
    const errFn = errorCallback ?? error;
    // Create the shader object
    const shader = gl.createShader(shaderType)!;

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        // Something went wrong during compilation; get the error
        const lastError = gl.getShaderInfoLog(shader)!;
        errFn(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(shaderSource, lastError)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function glEnumToString(gl: WebGLRenderingContext, type: number): string {
    const typeToString: Record<number, string> = {
        [gl.FLOAT]: 'FLOAT',
        [gl.FLOAT_VEC2]: 'FLOAT_VEC2',
        [gl.FLOAT_VEC3]: 'FLOAT_VEC3',
        [gl.FLOAT_VEC4]: 'FLOAT_VEC4',
        [gl.INT]: 'INT',
        [gl.INT_VEC2]: 'INT_VEC2',
        [gl.INT_VEC3]: 'INT_VEC3',
        [gl.INT_VEC4]: 'INT_VEC4',
        [gl.BOOL]: 'BOOL',
        [gl.BOOL_VEC2]: 'BOOL_VEC2',
        [gl.BOOL_VEC3]: 'BOOL_VEC3',
        [gl.BOOL_VEC4]: 'BOOL_VEC4',
        [gl.FLOAT_MAT2]: 'FLOAT_MAT2',
        [gl.FLOAT_MAT3]: 'FLOAT_MAT3',
        [gl.FLOAT_MAT4]: 'FLOAT_MAT4',
        [gl.SAMPLER_2D]: 'SAMPLER_2D',
        [gl.SAMPLER_CUBE]: 'SAMPLER_CUBE',
        [gl.ARRAY_BUFFER]: 'ARRAY_BUFFER',
    };
    return typeToString[type] ?? `0x${type.toString(16)}`;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 */
export function createProgram(
    gl: WebGLRenderingContext,
    shaders: WebGLShader[],
    attribs?: string[],
    locations?: number[],
    errorCallback?: ErrorCallback
): WebGLProgram | null {
    const errFn = errorCallback ?? error;
    const program = gl.createProgram();
    shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
    });
    if (attribs) {
        attribs.forEach(function (attrib, ndx) {
            gl.bindAttribLocation(
                program,
                locations ? locations[ndx] : ndx,
                attrib
            );
        });
    }
    gl.linkProgram(program);

    // Check the link status
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        const lastError = gl.getProgramInfoLog(program);
        errFn(`Error in program linking: ${lastError}\n${shaders.map(shader => {
            const src = addLineNumbersWithError(gl.getShaderSource(shader)!);
            const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
            return `${glEnumToString(gl, type)}:\n${src}`;
        }).join('\n')
            }`);

        gl.deleteProgram(program);
        return null;
    }
    return program;
}

/**
 * Loads a shader from a script tag.
 */
export function createShaderFromScript(
    gl: WebGLRenderingContext,
    scriptId: string,
    shaderType?: number,
    errorCallback?: ErrorCallback
): WebGLShader | null {
    let shaderSource = '';
    let _shaderType = shaderType;
    const shaderScript = document.getElementById(scriptId) as HTMLScriptElement;
    if (!shaderScript) {
        throw ('*** Error: unknown script element' + scriptId);
    }
    shaderSource = shaderScript.text;

    if (!shaderType) {
        if (shaderScript.type === 'x-shader/x-vertex') {
            _shaderType = gl.VERTEX_SHADER;
        }
        else if (shaderScript.type === 'x-shader/x-fragment') {
            _shaderType = gl.FRAGMENT_SHADER;
        }
        else if (_shaderType !== gl.VERTEX_SHADER
            && _shaderType !== gl.FRAGMENT_SHADER) {
            throw ('*** Error: unknown shader type');
        }
    }

    return loadShader(
        gl, shaderSource, shaderType ? shaderType : _shaderType!,
        errorCallback
    );
}

/**
 * Creates a program from 2 script tags.
 *
 */
export function createProgramFromScripts(
    gl: WebGLRenderingContext,
    shaderScriptIds: [string, string],
    attribs?: string[],
    locations?: number[],
    errorCallback?: ErrorCallback
): WebGLProgram {
    const shaders: WebGLShader[] = [];
    shaders.push(createShaderFromScript(
        gl, shaderScriptIds[0], gl.VERTEX_SHADER, errorCallback
    )!);
    shaders.push(createShaderFromScript(
        gl, shaderScriptIds[1], gl.FRAGMENT_SHADER, errorCallback
    )!);
    return createProgram(
        gl, shaders, attribs, locations, errorCallback
    )!;
}

/**
 * Creates a program from 2 sources.
 */
export function createProgramFromSources(
    gl: WebGLRenderingContext,
    shaderSources: [string, string],
    opt_attribs?: string[],
    opt_locations?: number[],
    opt_errorCallback?: ErrorCallback
): WebGLProgram {
    const shaders: WebGLShader[] = [];
    shaders.push(loadShader(
        gl, shaderSources[0], gl.VERTEX_SHADER, opt_errorCallback
    )!);
    shaders.push(loadShader(
        gl, shaderSources[1], gl.FRAGMENT_SHADER, opt_errorCallback
    )!);
    return createProgram(
        gl, shaders, opt_attribs, opt_locations, opt_errorCallback
    )!;
}

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvasToDisplaySize(
    canvas: HTMLCanvasElement,
    multiplier?: number
): boolean {
    multiplier = multiplier ?? 1;
    const width = canvas.clientWidth * multiplier | 0;
    const height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}
