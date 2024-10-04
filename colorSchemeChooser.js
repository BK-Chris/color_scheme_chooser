class Rect {
    constructor(x, y, width, height) {
        this.x = Number(x);
        this.y = Number(y);
        this.w = Number(width);
        this.h = Number(height);

        this.centerX = Number((x + width / 2));
        this.centerY = Number((y + height / 2));
    }

    move(deltaX, deltaY) {
        this.x += deltaX;
        this.centerX += deltaX;
        this.y += deltaY;
        this.centerY += deltaY;
    }

    rotate(radian, pivotX, pivotY) {
        const translatedX = this.centerX - pivotX;
        const translatedY = this.centerY - pivotY;

        const rotatedX = translatedX * Math.cos(radian) - translatedY * Math.sin(radian);
        const rotatedY = translatedX * Math.sin(radian) + translatedY * Math.cos(radian);

        this.x = (rotatedX + pivotX) - this.w / 2;
        this.y = (rotatedY + pivotY) - this.h / 2;
        this.centerX = (this.x + this.w / 2);
        this.centerY = (this.y + this.h / 2);
    }

    contains(x, y) {
        return (this.x <= x && x <= this.x + this.w)
            && (this.y <= y && y <= this.y + this.h);
    }

    toString() {
        return { x: this.x, y: this.y, width: this.w, height: this.h, centerX: this.centerX, centerY: this.centerY, };
    }
}

const c = document.getElementById("canvas");
const ctx = c.getContext("2d", { willReadFrequently: true });

let colorSchemeMode = "monochromatic"; // the default mode

const numberOfCirles = 6;
let currentCircle; // default, used to keep track of which segments are affected.
let currentPosition = { x: -1, y: -1 } // Used to keep track of movement of the mouse

let hitRectangles = []; // The clickable area of the small color picker circles.
let isMouseDown = false; // Used to prevent mouseMove from unintential triggering.
let isDragAllowed = false; // Whether the user clicked on a hitbox or not.

let midX = c.width / 2;
let midY = c.height / 2;
let minRadius = ((c.height > c.width) ? c.width / 2 : c.height / 2) / numberOfCirles;

let freeSpaceInward;
let freeSpaceOutward;

let degreeToRadian = (degree) => degree * Math.PI / 180;
let radianToDegree = (rad) => rad * (180 / Math.PI);
let clear = () => ctx.clearRect(0, 0, c.width, c.height);

let createRGBCode = (rgb) => 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
let calculateVectorDistance = (x1, y1, x2, y2) => Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));

const mainColors = [
    "#ac1a1a", "#d84060", "#a04080", "#4040a0",
    "#2060b0", "#0090a0", "#3da342", "#90a040",
    "#d0c040", "#d0a040", "#d07030", "#c05030", "#ac1a1a", // for smooth transition same as the first one
];

/***********************************************************/
/* Main */

initialize();

/***********************************************************/
/* FOR DEMO */
const form = document.getElementById("choose_mode");
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const modes = Array.from(document.getElementById("modes").children);
    hitRectangles = setMode(modes.find((mode) => mode.selected).value);
    refresh();
});
console.log(hitRectangles);

/* FOR DEMO */
/***********************************************************/

/***********************************************************/
/* Initialization */

function initialize() {
    setEventListeners();
    hitRectangles = setMode(colorSchemeMode);
    refresh();
}

function refresh() {
    clear();
    drawBackground();
    drawColorWheel();
    drawColorSelectors();
}

/***********************************************************/
/* Events, Eventhandlers */
function setEventListeners() {
    window.addEventListener("resize", reCalculateSizes);
    c.addEventListener("mousedown", (event) => { mouseDownHandler(event) });
    c.addEventListener("mousemove", (event) => { mouseMoveHandler(event) });
    c.addEventListener("mouseup", mouseUpHandler);
    c.addEventListener("mouseleave", mouseUpHandler);
}

function reCalculateSizes() {
    midX = c.width / 2;
    midY = c.height / 2;
    let maxRadius = (c.height > c.width) ? c.width / 2 : c.height / 2;
    minRadius = maxRadius / numberOfCirles;
    isMouseDown = false;
    isDragAllowed = false;
    refresh();
}

function mouseDownHandler(event) {
    isMouseDown = true;
    canvasRect = canvas.getBoundingClientRect();
    currentPosition.x = event.clientX - canvasRect.left;
    currentPosition.y = event.clientY - canvasRect.top;
    console.log(currentPosition);

    let i = 0;
    while (hitRectangles.length != i && !hitRectangles[i].contains(currentPosition.x, currentPosition.y))
        i++;

    if (i != hitRectangles.length) {
        currentCircle = Math.floor(calculateVectorDistance(midX, midY, currentPosition.x, currentPosition.y) / minRadius) + 1;
        isDragAllowed = true;
    } else {
        isDragAllowed = false;
    }
}

function mouseMoveHandler(event) {
    if (!isMouseDown || !isDragAllowed) return;
    /* Rotation implementation */
    const lastPosition = { x, y } = currentPosition;
    const lastAngle = Math.atan2(lastPosition.y - midY, lastPosition.x - midX);

    currentPosition.x = event.clientX - canvasRect.left;
    currentPosition.y = event.clientY - canvasRect.top;

    const newAngle = Math.atan2(currentPosition.y - midY, currentPosition.x - midX);
    const deltaAngle = newAngle - lastAngle;

    hitRectangles.forEach(hitRect => { hitRect.rotate(deltaAngle, midX, midY); });

    /* Jump implementation */
    const newCirle = Math.floor(calculateVectorDistance(midX, midY, currentPosition.x, currentPosition.y) / minRadius) + 1;

    if (newCirle < currentCircle && freeSpaceInward > 0) {
        hitRectangles.forEach(hitRect => {
            const currentDistance = calculateVectorDistance(hitRect.centerX,
                hitRect.centerY, midX, midY)
            let directionVector;

            directionVector = { // Moves towards center
                x: (midX - hitRect.centerX) * (minRadius / currentDistance),
                y: (midY - hitRect.centerY) * (minRadius / currentDistance)
            }
            hitRect.move(directionVector.x, directionVector.y);
        });
        currentCircle--
        freeSpaceInward--;
        freeSpaceOutward++;

    } else if (newCirle > currentCircle && freeSpaceOutward > 0) {
        hitRectangles.forEach(hitRect => {
            const currentDistance = calculateVectorDistance(hitRect.centerX,
                hitRect.centerY, midX, midY)
            let directionVector;

            directionVector = { // Moves away from center
                x: (hitRect.centerX - midX) * (minRadius / currentDistance),
                y: (hitRect.centerY - midY) * (minRadius / currentDistance)
            }
            hitRect.move(directionVector.x, directionVector.y);
        });
        currentCircle = newCirle;
        freeSpaceInward++;
        freeSpaceOutward--;
    }

    refresh();
}

function mouseUpHandler() {
    isMouseDown = false;
    isDragAllowed = false;
}

/***********************************************************/
/* Functions */

function drawBackground() {
    ctx.save();
    ctx.fillStyle = "black";
    ctx.rect(0, 0, c.width, c.height);
    ctx.fill();
    ctx.restore();
}

function drawColorWheel() {
    ctx.save();
    for (let i = numberOfCirles; i > 0; i--) {
        const gradient = ctx.createConicGradient(degreeToRadian(30), midX, midY);
        for (let j = 0; j < mainColors.length; j++) {
            gradient.addColorStop((1 / mainColors.length) * j, adjustShade(hexToRgb(mainColors[j]), Math.pow(1.15, (numberOfCirles - i))));
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(midX, midY, minRadius * i, 0, degreeToRadian(360));
        ctx.fill();
    }
    ctx.restore();
};

function drawColorSelectors() {
    ctx.save();
    ctx.lineWidth = 5;
    hitRectangles.forEach(hitRect => {
        const imageData = ctx.getImageData(hitRect.centerX, hitRect.centerY, 1, 1);
        ctx.beginPath();
        ctx.fillStyle = createRGBCode(imageData.data.slice(0, 3));
        ctx.strokeStyle = "white";
        ctx.arc(hitRect.centerX, hitRect.centerY, (minRadius / 1.2) / 2, 0, degreeToRadian(360));
        ctx.fill();
        ctx.stroke();
    });
    ctx.restore();
}

function getChoosenShades() {
    shades = [];
    hitRectangles.forEach(hitRect => {
        const imageData = ctx.getImageData(hitRect.centerX, hitRect.centerY, 1, 1);
        shades.push(createRGBCode(imageData.data.slice(0, 3)));
    });
    return shades;
}

/* Color Scheme Modes */
function setMode(mode) {
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
            repetation = 2;
            break;
        case "complementary":
            degreeStops = [270, 90];
            repetation = 2;
            break;
        case "split-complementary":
            degreeStops = [270, 60, 120];
            repetation = 2;
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
            console.error("The requested mode does not exists!");
    }

    let rects = [];
    for (let rep = 0; rep < repetation; rep++) {
        for (let i = 0; i < degreeStops.length; i++) {
            let distanceFromMidPoint = ((minRadius * (numberOfCirles - 1) + minRadius / 2) - minRadius * rep);
            let x = midX + distanceFromMidPoint * Math.cos(degreeToRadian(degreeStops[i]));
            let y = midY + distanceFromMidPoint * Math.sin(degreeToRadian(degreeStops[i]));
            rects.push(new Rect(x - minRadius / 2, y - minRadius / 2, minRadius, minRadius));
        }
    }
    //currentCircle = numberOfCirles;
    freeSpaceInward = numberOfCirles - repetation;
    freeSpaceOutward = 0;
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
/* For visual debugging, not part of the project. */

async function pause(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function hightLightHitRects() {
    ctx.save();
    hitRectangles.forEach(hitRect => {
        ctx.beginPath();
        ctx.rect(hitRect.x, hitRect.y, hitRect.w, hitRect.h);
        ctx.strokeStyle = "red";
        ctx.stroke();
        ctx.closePath();
    });
    ctx.restore();
}