/**
 * Colors as stored for graphics manipulation: UInt8Array of r,g,b,a bytes.
 */
export class ColorBuffer {

    readonly width: number;
    readonly height: number;

    /**
     * Each portion of an RGBA pixel occupies a single space
     * in the array.
     */
    readonly buffer: Uint8Array;

    readonly size: number;
    /**
     * 
     * @param width 
     * @param height 
     * @param value - optional starting value for all buffer values.
     */
    constructor(width: number, height: number, value?: number) {
        this.width = width;
        this.height = height;

        const size = this.size = 4 * width * height;

        const buff = this.buffer = new Uint8Array(this.size);
        if (value) {

            let i = 0;
            const r = 0xFF & (value >> 16);
            const g = (0xFF) & (value >> 8);
            const b = 0xFF & value;
            const a = 0xFF & (value >> 24);
            while (i < size) {

                buff[i++] = r;
                buff[i++] = g;
                buff[i++] = b;
                buff[i++] = a;
            }

        }
    }

    set(x: number, y: number, color: number) {

        let ind = 4 * (x + y * this.width);

        this.buffer[ind++] = 0xff & (color >> 16);
        this.buffer[ind++] = 0xFF & (color >> 8);
        this.buffer[ind++] = 0xFF & color;

        /// full alpha.
        this.buffer[ind] = 255;

    }
    get(x: number, y: number) {

        let ind = 4 * (x + y * this.width);

        return (this.buffer[ind] << 16) + (this.buffer[ind + 1] << 8) + (this.buffer[ind + 2]) + (this.buffer[ind + 3] << 24);

    }

    /**
     * Set the color for a displacement of pixels dx,dy
     * @param x - image x coordinate
     * @param y - image y coordinate
     * @param dx - x displacement amount from -1 to 1
     * @param dy - x displacement amount from -1 to 1
     */
    setDisplaceColor(x: number, y: number, dx: number, dy: number) {

        let ind = 4 * (x + y * this.width);
        this.buffer[ind++] = Math.floor(128 + 128 * dx);
        this.buffer[ind++] = Math.floor(128 + 128 * dy);
        this.buffer[ind++] = 0;
        // blue ignored.
        /// ignored by displacement maps but useful for testing.
        this.buffer[ind] = 255;

    }


}


export class ImageBuffer {

    readonly width: number;
    readonly height: number;

    readonly buffer: Uint32Array;

    readonly size: number;
    /**
     * 
     * @param width 
     * @param height 
     * @param value - optional starting value for all buffer values.
     */
    constructor(width: number, height: number, value?: number) {
        this.width = width;
        this.height = height;

        this.size = width * height;

        const buff = this.buffer = new Uint32Array(this.size);
        if (value) {
            for (let i = this.size - 1; i >= 0; i--) {
                buff[i] = value;
            }
        }
    }

    set(x: number, y: number, color: number) {

        this.buffer[y * this.width + x] = color;
    }
    get(x: number, y: number) {
        return this.buffer[y * this.width + x];
    }

    /**
     * Set the color for a displacement of pixels dx,dy
     * @param x - image x coordinate
     * @param y - image y coordinate
     * @param dx - x displacement amount from -1 to 1
     * @param dy - x displacement amount from -1 to 1
     */
    setDisplaceColor(x: number, y: number, dx: number, dy: number) {

        this.buffer[x + y * this.width] = (Math.floor(128 + 128 * dx) << 16) +
            (Math.floor(128 + 128 * dy) << 8);
    }


}