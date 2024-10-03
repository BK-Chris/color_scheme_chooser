class Rect {
    constructor(x, y, width, height) {
        this.x = Number(x);
        this.y = Number(y);
        this.w = Number(width);
        this.h = Number(height);
    }

    getMiddlePoint() {
        return {
            x: Number((this.x + this.w / 2)),
            y: Number((this.y + this.h / 2))
        }
    }

    contains(x, y) {
        return (this.x <= x && x <= this.x + this.w)
            && (this.y <= y && y <= this.y + this.h);
    }

    toString() {
        return { x: this.x, y: this.y, width: this.w, height: this.h };
    }
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d");
const steps = 6; // number of shades -1 (white in the middle)
//const numberOfShadeSelectors = 4 // must be less than or equal to steps - 1

var currentMode = "monochromatic";
var currentAngle = 270;
var currentPosition = { x: -1, y: -1 }

var hitRects = []; // If the current location is within one of the hitRects drag is allowed.
var selectedHitRectIndex = -1;
var isMouseDown = false;
var isDragAllowed = false;


var midX = () => c.clientWidth / 2;
var midY = () => c.clientHeight / 2;
var maxBound = () => (c.clientHeight > c.clientWidth) ? c.clientWidth : c.clientHeight;
var degreeToRad = (degree) => degree * Math.PI / 180;
var clear = () => ctx.clearRect(0, 0, c.width, c.height);
var minRadius = () => maxBound() / 2 / steps;
var createRGBCode = (rgb) => 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';

const mainColors = [
    "#ac1a1a", "#d84060", "#a04080", "#4040a0",
    "#2060b0", "#0090a0", "#3da342", "#90a040",
    "#d0c040", "#d0a040", "#d07030", "#c05030", "#ac1a1a", // for smooth transition same as the first one
];

/***********************************************************/
/* Main */

initialize();

/***********************************************************/
/* Initialization */

function initialize() {
    refresh()
    setEventListeners();
}

function refresh() {
    clear();
    drawColorWheel();
    setMode(currentMode, currentAngle);
    console.log(getChoosenShades());
}

/***********************************************************/
/* Events, Eventhandlers */
function setEventListeners() {
    c.addEventListener("mousedown", (event) => { mouseDownHandler(event) });
    c.addEventListener("mousemove", (event) => { mouseMoveHandler(event) });
    c.addEventListener("mouseup", mouseUpHandler);
}

function mouseDownHandler(event) {
    isMouseDown = true;
    canvasRect = canvas.getBoundingClientRect();
    currentPosition.x = event.clientX - canvasRect.left;
    currentPosition.y = event.clientY - canvasRect.top;

    let i = 0;
    while (hitRects.length != i && !hitRects[i].contains(currentPosition.x, currentPosition.y))
        i++;

    if (i != hitRects.length) {
        isDragAllowed = true;
        selectedHitRectIndex = i;
    } else {
        isDragAllowed = false;
    }
}

function mouseMoveHandler(event) {
    if (!isMouseDown || !isDragAllowed) return;
    currentPosition.x = event.clientX - canvasRect.left;
    currentPosition.y = event.clientY - canvasRect.top;
    currentAngle = Math.atan2(currentPosition.y - midY(), currentPosition.x - midX()) * (180 / Math.PI);
    refresh();
}

function mouseUpHandler() {
    isMouseDown = false;
    isDragAllowed = false;
    console.log(getChoosenShades());
}

/***********************************************************/
/* Functions */


function drawColorWheel() {
    ctx.save();
    for (let i = steps; i > 0; i--) {
        const gradient = ctx.createConicGradient(degreeToRad(30), midX(), midY());
        for (let j = 0; j < mainColors.length; j++) {
            //gradient.addColorStop((1 / mainColors.length) * j, adjustShade(hexToRgb(mainColors[j]), Math.pow(1.1, (steps - i)))); exponential color change
            gradient.addColorStop((1 / mainColors.length) * j, adjustShade(hexToRgb(mainColors[j]), 1 + (1 - i / steps)));
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(midX(), midY(), minRadius() * i, 0, degreeToRad(360));
        ctx.fill();
    }
    /* Adds a white circle at the end. */
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(midX(), midY(), minRadius(), 0, degreeToRad(360));
    ctx.fill();
    ctx.restore();
};

function drawColorSelectors() {
    ctx.save();
    ctx.lineWidth = 5;
    hitRects.forEach(hitRect => {
        let midPoint = hitRect.getMiddlePoint();
        const imageData = ctx.getImageData(midPoint.x, midPoint.y, 1, 1);
        ctx.beginPath();
        ctx.fillStyle = createRGBCode(imageData.data.slice(0, 3));
        ctx.strokeStyle = "white";
        ctx.arc(midPoint.x, midPoint.y, (minRadius() / 1.2) / 2, 0, degreeToRad(360));
        ctx.fill();
        ctx.stroke();
    });
    ctx.restore();
}

function getChoosenShades() {
    shades = [];
    hitRects.forEach(hitRect => {
        let midPoint = hitRect.getMiddlePoint();
        const imageData = ctx.getImageData(midPoint.x, midPoint.y, 1, 1);
        shades.push(createRGBCode(imageData.data.slice(0, 3)));
    });
    return shades;
}

/* Color Scheme Modes */
function setMode(mode, degree) {
    /* These are the id names of the color schemes */
    switch (mode) {
        case "monochromatic":
            hitRects = monochromatic(degree);
            break;
        case "analogous":
            hitRects = analogous(degree);
            break;
        case "complementary":
            hitRects = complementary(degree);
            break;
        case "split-complementary":
            hitRects = splitComplementary(degree);
            break;
        case "triadic":
            hitRects = triadic(degree);
            break;
        case "tetradic":
            hitRects = tetradic(degree);
            break;
        case "square":
            hitRects = square(degree);
            break;
        default:
            console.error("The requested mode does not exists!");
    }
    drawColorSelectors();
}

// Use it for rect creation only!
function monochromatic(degree) {
    let rects = [];
    for (let i = 1; i < steps; i++) {
        let distanceFromMidPoint = (minRadius() * i + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function analogous(degree) {
    const deltaDegree = 30;
    degree -= deltaDegree;
    let rects = [];
    for (let i = 1; i <= 3; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + deltaDegree * i));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + deltaDegree * i));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function complementary(degree) {
    const deltaDegree = 180;
    let rects = [];
    for (let i = 1; i <= 2; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + deltaDegree * i));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + deltaDegree * i));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function splitComplementary(degree) {
    const degreeStops = [0, 150, 210];
    let rects = [];
    for (let i = 1; i <= 3; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + degreeStops[i - 1]));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + degreeStops[i - 1]));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function triadic(degree) {
    const deltaDegree = 120;
    let rects = [];
    for (let i = 1; i <= 3; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + deltaDegree * i));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + deltaDegree * i));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function tetradic(degree) {
    const degreeStops = [0, 60, 180, 240];
    let rects = [];
    for (let i = 1; i <= 4; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + degreeStops[i - 1]));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + degreeStops[i - 1]));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function square(degree) {
    const deltaDegree = 90;
    let rects = [];
    for (let i = 1; i <= 4; i++) {
        let distanceFromMidPoint = (minRadius() * (steps - 1) + minRadius() / 2);
        let x = midX() + distanceFromMidPoint * Math.cos(degreeToRad(degree + deltaDegree * i));
        let y = midY() + distanceFromMidPoint * Math.sin(degreeToRad(degree + deltaDegree * i));
        rects.push(new Rect(x - minRadius() / 2, y - minRadius() / 2, minRadius(), minRadius()));
    }
    return rects;
}

function hexToRgb(hex) {
    hex = hex.replace("#", "");

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

function adjustShade(rgb, factor) {
    let r = Math.min(255, Math.round(rgb.r * factor));
    let g = Math.min(255, Math.round(rgb.g * factor));
    let b = Math.min(255, Math.round(rgb.b * factor));
    return "rgb(" + r + ',' + g + ',' + b + ")";
}

/***********************************************************/
/* For visual debugging! */

async function pause(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function hightLightHitRects() {
    ctx.save();
    hitRects.forEach(hitRect => {
        ctx.beginPath();
        ctx.rect(hitRect.x, hitRect.y, hitRect.w, hitRect.h);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
    });
    ctx.restore();
}

const form = document.getElementById("choose_mode");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const modes = Array.from(document.getElementById("modes").children);
    currentMode = modes.find((mode) => mode.selected).value;
    refresh();
});