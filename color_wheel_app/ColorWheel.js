"use strict";
// Requires Rectangle class
class ColorWheel {
    constructor(canvasElement, numberOfShades = 6, colorSchemeMode = "monochromatic") {
        if (!(canvasElement instanceof HTMLCanvasElement))
            throw new Error(`${canvasElement} is not a HTMLCanvasElement!`);
        this.events = {
            colorsChanged: new Event('colorChanged')
        };

        this._mainColors = [
            "#ac1a1a", "#d84060", "#a04080", "#4040a0",
            "#2060b0", "#0090a0", "#3da342", "#90a040",
            "#d0c040", "#d0a040", "#d07030", "#c05030", "#ac1a1a",
        ];

        this._isMouseDown = false; // Used to prevent mouseMove from unintential triggering.
        this._isDragAllowed = false; // Whether the user clicked on a hitbox or not.

        this._c = canvasElement;
        this._ctx = this._c.getContext("2d", { willReadFrequently: true }); // MDN: This will force the use of a software (instead of hardware accelerated) 2D canvas and can save memory when calling getImageData() frequently.
        this._c.width = this._c.clientWidth;
        this._c.height = this._c.clientHeight;
        this._canvasMidX = this._c.width / 2;
        this._canvasMidY = this._c.height / 2;
        this._minRadius = (this._c.height > this._c.width)
            ? this._c.width / 2 / numberOfShades
            : this._c.height / 2 / numberOfShades;

        this._isTouchDevice = this._isTouchDevice();
        this._currentPosition; // Used to keep track of movement of the mouse
        this._currentShade; // will get value onClick or onTouchStart

        this._numberOfShades = numberOfShades;
        this._colorSchemeMode = colorSchemeMode;

        this._hitRectangles; // The clickable area of the small color picker circles.
        this._freeSpaceInward;
        this._freeSpaceOutward;

        this._init();
    }

    _init() {
        (this._isTouchDevice)
            ? this._setTouchEvents()
            : this._setClickEventListeners();
        this.setColorSchemeMode(this._colorSchemeMode);
    }

    _isTouchDevice() {
        return (
            "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }

    get mouseDown() { return this._isMouseDown; }
    set mouseDown(value) { this._isMouseDown = value; }

    get dragAllowed() { return this._isDragAllowed; }
    set dragAllowed(value) { this._isDragAllowed = value; }

    get cWidth() { return this._c.width; }
    set cWidth(value) {
        this._c.width = value;
        this._canvasMidX = value / 2;
        this._minRadius = (this.cHeight > value)
            ? value / 2 / this.numberOfShades
            : this.cHeight / 2 / this.numberOfShades;
    }

    get cHeight() { return this._c.height; }
    set cHeight(value) {
        this._c.height = value;
        this._canvasMidY = value / 2;
        this._minRadius = (value > this.cWidth)
            ? this.cWidth / 2 / this.numberOfShades
            : value / 2 / this.numberOfShades;
    }

    get canvasMidX() { return this._canvasMidX; }
    get canvasMidY() { return this._canvasMidY; }
    get minRadius() { return this._minRadius; }

    get currentPosition() { return this._currentPosition; }
    set currentPosition(value) { this._currentPosition = value; }

    get currentShade() { return this._currentShade; }
    set currentShade(value) { this._currentShade = value; }

    get numberOfShades() { return this._numberOfShades; }
    get colorSchemeMode() { return this._colorSchemeMode; } // Use setMode() to modify!

    get hitRectangles() { return this._hitRectangles; }
    set hitRectangles(value) { this._hitRectangles = value; }

    /* Helper Functions */
    degreeToRadian = (degree) => degree * Math.PI / 180;
    radianToDegree = (rad) => rad * (180 / Math.PI);
    calculateVectorDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    clear = () => this._ctx.clearRect(0, 0, this.cWidth, this.cHeight);

    /***********************************************************/
    /* Events, Eventhandlers */


    _reCalculateSizes() {
        if (this.cWidth === this._c.clientWidth && this.cHeight === this._c.clientHeight)
            return;
        this.cWidth = this._c.clientWidth;
        this.cHeight = this._c.clientHeight;
        this.setColorSchemeMode(this.colorSchemeMode);
    }


    _setTouchEvents() {
        this._c.addEventListener("touchstart", this._mouseDownHandler.bind(this));
        this._c.addEventListener("touchmove", this._mouseMoveHandler.bind(this));
        this._c.addEventListener("touchcancel", this._movementEndHandler.bind(this));
        this._c.addEventListener("touchend", this._movementEndHandler.bind(this));
        window.addEventListener("resize", this._reCalculateSizes.bind(this));
    }

    _setClickEventListeners() {
        this._c.addEventListener("mousedown", this._mouseDownHandler.bind(this));
        this._c.addEventListener("mousemove", this._mouseMoveHandler.bind(this));
        this._c.addEventListener("mouseleave", this._movementEndHandler.bind(this));
        this._c.addEventListener("mouseup", this._movementEndHandler.bind(this));
        window.addEventListener("resize", this._reCalculateSizes.bind(this));
    }

    _mouseDownHandler(event) {
        if (this.mouseDown) return;

        this.mouseDown = true;
        this.currentPosition = this._getCurrentPosition(event);

        let i = 0;
        while (this.hitRectangles.length != i && !this.hitRectangles[i].contains(this.currentPosition.x, this.currentPosition.y))
            i++;

        if (i != this.hitRectangles.length) {
            this.currentShade = Math.floor(this.calculateVectorDistance(this.canvasMidX, this.canvasMidY, this.currentPosition.x, this.currentPosition.y) / this.minRadius) + 1;
            this.dragAllowed = true;
        } else {
            this.dragAllowed = false;
        }
    }

    _mouseMoveHandler(event) {
        if (!this.mouseDown || !this.dragAllowed) return;
        event.preventDefault();

        /* Rotation implementation */
        const lastPosition = this.currentPosition;
        const lastAngle = Math.atan2(lastPosition.y - this.canvasMidY, lastPosition.x - this.canvasMidX);

        this.currentPosition = this._getCurrentPosition(event);

        const newAngle = Math.atan2(this.currentPosition.y - this.canvasMidY, this.currentPosition.x - this.canvasMidX);
        const deltaAngle = newAngle - lastAngle;

        this.hitRectangles.forEach(hitRect => { hitRect.rotate(deltaAngle, this.canvasMidX, this.canvasMidY); });

        /* Jump implementation */
        const newShade = Math.floor(this.calculateVectorDistance(this.canvasMidX, this.canvasMidY, this.currentPosition.x, this.currentPosition.y) / this.minRadius) + 1;

        if (newShade < this.currentShade && this._freeSpaceInward > 0) { // Moves towards center
            this.hitRectangles.forEach(hitRect => {
                const currentDistance = this.calculateVectorDistance(hitRect.centerX, hitRect.centerY, this.canvasMidX, this.canvasMidY)
                let directionVector = {
                    x: (this.canvasMidX - hitRect.centerX) * (this.minRadius / currentDistance),
                    y: (this.canvasMidY - hitRect.centerY) * (this.minRadius / currentDistance)
                }
                hitRect.move(directionVector.x, directionVector.y);
            });
            this.currentShade--
            this._freeSpaceInward--;
            this._freeSpaceOutward++;
        }

        if (newShade > this.currentShade && this._freeSpaceOutward > 0) { // Moves away from center
            this.hitRectangles.forEach(hitRect => {
                const currentDistance = this.calculateVectorDistance(hitRect.centerX,
                    hitRect.centerY, this.canvasMidX, this.canvasMidY)
                let directionVector = {
                    x: (hitRect.centerX - this.canvasMidX) * (this.minRadius / currentDistance),
                    y: (hitRect.centerY - this.canvasMidY) * (this.minRadius / currentDistance)
                }
                hitRect.move(directionVector.x, directionVector.y);
            });
            this.currentShade++;
            this._freeSpaceInward++;
            this._freeSpaceOutward--;
        }

        this.refresh();
    }

    _movementEndHandler() {
        this.mouseDown = false;
        this.dragAllowed = false;
    }

    /* Drawing */
    _drawBackground() {
        this._ctx.save();
        this._ctx.fillStyle = "black";
        this._ctx.rect(0, 0, this.cWidth, this.cHeight);
        this._ctx.fill();
        this._ctx.restore();
    }

    _drawColorWheel() {
        this._ctx.save();
        for (let i = this.numberOfShades; i > 0; i--) {
            const gradient = this._ctx.createConicGradient(this.degreeToRadian(30), this.canvasMidX, this.canvasMidY);
            for (let j = 0; j < this._mainColors.length; j++) {
                gradient.addColorStop((1 / this._mainColors.length) * j,
                    this._adjustShade(this.hexToRgbObject(this._mainColors[j]), Math.pow(1.15, (this.numberOfShades - i))));
            }
            this._ctx.fillStyle = gradient;
            this._ctx.beginPath();
            this._ctx.arc(this.canvasMidX, this.canvasMidY, this.minRadius * i, 0, this.degreeToRadian(360));
            this._ctx.fill();
        }
        this._ctx.restore();
    };

    _drawColorSelectors() {
        this._ctx.save();
        this._ctx.lineWidth = 2;
        this._hitRectangles.forEach(hitRect => {
            const imageData = this._ctx.getImageData(hitRect.centerX, hitRect.centerY, 1, 1);
            this._ctx.beginPath();
            const fillColor = imageData.data.slice(0, 3);
            this._ctx.fillStyle = this.createRGBString(fillColor);
            this._ctx.strokeStyle = (this.isLight(fillColor)) ? "black" : "white";
            this._ctx.arc(hitRect.centerX, hitRect.centerY, this.minRadius / 2, 0, this.degreeToRadian(360));
            this._ctx.fill();
            this._ctx.stroke();
        });
        this._ctx.restore();
    }

    /* Private functions */

    _getCurrentPosition(event) {
        const canvasRect = this._c.getBoundingClientRect();
        return {
            x: (this._isTouchDevice ? event.touches[0].clientX : event.clientX) - canvasRect.left,
            y: (this._isTouchDevice ? event.touches[0].clientY : event.clientY) - canvasRect.top
        };
    }

    _adjustShade(_rgb, factor) { // Changes lightness level depending on the given factor
        let rgb = []
        rgb.push(Math.min(255, Math.round(_rgb.r * factor))); // Red
        rgb.push(Math.min(255, Math.round(_rgb.g * factor))); // Green
        rgb.push(Math.min(255, Math.round(_rgb.b * factor))); // Blue
        return this.createRGBString(rgb);
    }

    /* Public functions */
    setColorSchemeMode(mode) { // Color Scheme Modes 
        let degreeStops;
        let repetation; // How many row to make must be lower than the number of circles!

        /* These are the id names of the color schemes */
        switch (mode) {
            case "monochromatic":
                degreeStops = [270];
                repetation = 4;
                break;
            case "analogous":
                degreeStops = [240, 270, 300];
                repetation = 1;
                break;
            case "complementary":
                degreeStops = [270, 90];
                repetation = 2;
                break;
            case "split-complementary":
                degreeStops = [270, 60, 120];
                repetation = 1;
                break;
            case "triadic":
                degreeStops = [270, 30, 150];
                repetation = 1;
                break;
            case "tetradic":
                degreeStops = [240, 300, 60, 120];
                repetation = 1;
                break;
            case "square":
                degreeStops = [270, 0, 90, 180];
                repetation = 1;
                break;
            default:
                console.error(`The requested mode [${mode}] does not exists!`);
                mode = "monochromatic"
                degreeStops = [270];
                repetation = 4;
        }

        this.hitRectangles = [];
        for (let rep = 0; rep < repetation; rep++) {
            for (let i = 0; i < degreeStops.length; i++) {
                let distanceFromMidPoint = ((this.minRadius * (this.numberOfShades - 1) + this.minRadius / 2) - this.minRadius * rep);
                let x = this.canvasMidX + distanceFromMidPoint * Math.cos(this.degreeToRadian(degreeStops[i]));
                let y = this.canvasMidY + distanceFromMidPoint * Math.sin(this.degreeToRadian(degreeStops[i]));
                this.hitRectangles.push(new Rectangle(x - this.minRadius / 2, y - this.minRadius / 2, this.minRadius, this.minRadius));
            }
        }
        this._colorSchemeMode = mode;
        this._freeSpaceInward = this.numberOfShades - repetation;
        this._freeSpaceOutward = 0;

        this.refresh();
    }

    refresh() {
        this.clear();
        this._drawBackground();
        this._drawColorWheel();
        this._drawColorSelectors();
        this._c.dispatchEvent(this.events.colorsChanged);
    }

    getChoosenShades() { // Returns the color of the mid point of each hitRectangle
        let shades = [];
        this.hitRectangles.forEach(hitRect => {
            const imageData = this._ctx.getImageData(hitRect.centerX, hitRect.centerY, 1, 1);
            shades.push(this.createRGBString(imageData.data.slice(0, 3)));
        });
        return shades;
    }

    createRGBString(rgb) {
        return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')'
    };

    hexToRgbObject(hex) {
        hex = hex.replace("#", "");
        try {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        } catch (err) {
            console.error(`Ran into some error converting this [${hex}] value.`)
            return null;
        }
    }

    isLight(rgb) {
        const luminance = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
        return luminance > 128 ? true : false;
    }

    hightLightHitRectangles(color) { // Highlightes hitboxes
        this._ctx.save();
        this.hitRectangles.forEach(hitRect => {
            console.log(hitRect);
            this._ctx.beginPath();
            this._ctx.rect(hitRect.x, hitRect.y, hitRect.w, hitRect.h);
            this._ctx.strokeStyle = color;
            this._ctx.stroke();
            this._ctx.closePath();
        });
        this._ctx.restore();
    }
}