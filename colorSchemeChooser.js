/******************************/
/*                            */
/*                            */
/*                            */
/*                            */ /* arc(x,y,radius,startAngle,endAngle)*/
/*              ************  */ /* Start Angle */
/*                       <*   */
/*                      <*    */
/*          ClockWise  <*     */
/*                    <*      */
/******************************/
/* Variables */
var mainColors = [
    "#E62321",
    "#E6348D",
    "#524594",

    "#2B499A",
    "#0A70B8",
    "#00A7AC",

    "#69B42D",
    "#B0CA0D",
    "#F5E71A",

    "#FABB0F",
    "#F18318",
    "#E8571B"
]

/* Customizable parameters */
const whiteCirclePercentage = 25;
const donutPercentage = 75;
const activeColorPercentage = 100;
const startDegree = 15;

/* Variables and helper functions */
const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

var degreeToRad = (degree) => degree * Math.PI / 180;
var clear = () => ctx.clearRect(0, 0, c.width, c.height);
var midX = () => c.clientWidth / 2;
var midY = () => c.clientHeight / 2;
var maxBound = () => (c.clientHeight > c.clientWidth) ? c.clientWidth : c.clientHeight;

/* Where the fun begins */
createDonut();
createWhiteCirle();

/* Other larger functions */
function createDonut() {
    let whiteCircleRadius = (maxBound() / (100 / whiteCirclePercentage)) / 2;
    let donutRadius = (maxBound() / (100 / donutPercentage)) / 2
    /*let activeColorRadius = (maxBound() / (100 / activeColorPercentage)) / 2*/

    let deltaDeg = 360 / mainColors.length;
    for (let i = 0; i < mainColors.length; i++) {
        let deltaX = whiteCircleRadius * Math.cos(deltaDeg * i + startDegree);
        let deltaY = whiteCircleRadius * Math.sin(deltaDeg * i + startDegree);
        ctx.moveTo(midX() + deltaX, midY() + deltaY);

        ctx.beginPath();
        deltaX = donutRadius * Math.cos(deltaDeg * i + startDegree);
        deltaY = donutRadius * Math.sin(deltaDeg * i + startDegree);
        ctx.lineTo(midX() + deltaX, midY + deltaY);
        ctx.arc(midX(), midY(), donutRadius, degreeToRad(deltaDeg * i + startDegree), degreeToRad((i + 1) * deltaDeg + startDegree));
        deltaX = whiteCircleRadius * Math.cos(deltaDeg * (i + 1));
        deltaY = whiteCircleRadius * Math.sin(deltaDeg * (i + 1));
        ctx.lineTo(midX() + deltaX, midY + deltaY);
        ctx.arc(midX(), midY(), whiteCircleRadius, degreeToRad((i + 1) * deltaDeg + startDegree), degreeToRad(deltaDeg * i + startDegree), true);

        ctx.fillStyle = mainColors[i];
        ctx.fill();
        ctx.closePath();
    }
}

function createWhiteCirle() {
    let whiteCircleRadius = (maxBound() / (100 / whiteCirclePercentage)) / 2;

    ctx.beginPath();
    ctx.arc(midX(), midY(), whiteCircleRadius, 0, degreeToRad(360));
    ctx.fillStyle = "#FFFFFF";

    ctx.fill();
    ctx.closePath();
}