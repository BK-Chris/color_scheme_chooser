# Color Scheme Chooser

This JavaScript application was created for the project [elte_web_project](https://github.com/BK-Chris/elte_web_project).

You can check out the live version on my GitHub Pages: [here](https://bk-chris.github.io/elte_web_project/pages/color_scheme.html).

## Disclaimer

As the "game" is intended for the website, no further improvements or debugging is to be expected.
Well aware that a thousands similar and better objects exists like this, but had fun practising coding and made me realize how important math can be in certain situations where you need to calculate vector distances, make different transformations etc.
You can imagine how much more complex it gets once you try to code acurate physics especially in 3D projects.

---

## Features

* **Interactive Color Wheel:**  Visually select colors by clicking and dragging on the color wheel's color picker cirles.

* **Color Scheme Modes:** Choose from various color harmony modes:
    * Monochromatic
    * Analogous
    * Complementary
    * Split Complementary
    * Triadic
    * Tetradic
    * Square

* **

## Usage

Select a mode from the dropdown menu and drag the little circles on the canvas to choose a color.

-------

## Documentation

Describes the variables, logic, and functions of the application.

### Global Varibles
>* **colorSchemeMode** The current color scheme mode.
>* **numberOfCirles** The number of circles.
>* **currentCircle** Used to keep track of whether the circle has been moved to a new circle
>* **currentPosition** Used to keep track of movement of the mouse
>* **hitRectangles** The clickable area of the small color picker circles.
>* **isMouseDown** Used to prevent mouseMove from unintential triggering.
>* **isDragAllowed** Whether the user clicked on a hitbox or not.
>* **midX** The color wheel's center point on the X axis.
>* **midY** The color wheel's center point on the Y axis.
>* **minRadius** = maxRadius / numberOfCirles. Also the rate at which each hitbox move out/inward to/from the (midX,midY).
>* **freeSpaceInward** The number of free space available inward. Used to prevent from going further as that would lead to undesireable behaviour of the color pickers.
>* **freeSpaceOutward** The number of free space available outward. Used to prevent from going further as that would lead to undesireable behaviour of the color pickers.
>* **mainColors[0..n]** In this example I use 12 colors but you could add more or less.

### Helper Functions

>* **degreeToRadian(degree)** Converts degree value to radian.
>* **radianToDegree(rad)** Converts radian value to degree.
>* **clear()** Clears the canvas.
>* **createRGBCode(rgb[0..2])** Returns an RGB string.
>* **calculateVectorDistance(x1,y1,x2,y2)** Calculates the vector distance.

------

### Functions

>`Note: This could be the constructor along with its (as of now) global variables.`
>* **initialize()**
    Responsible to set up the event handlers, gets the [hitRectangles](#global-varibles) from setMode() then calls refresh().

>* **refresh()**
Initially this function draws the canvas as well as responsible for redrawing the canvas. Clears the canvas calling [clear](#helper-functions)

>* **setEventListeners()**
Called once to set the event listeners on the page. Listens to "resize" of the window, "mousedown", "mousemove", "mouseup", "mouseleave" events. More about the event listeners used [here](#event-listeners).

#### Drawing functions
>* **drawColorWheel()** Draws the color wheel on the canvas with a conic gradient and multiple circles also utalizes the `adjustShade(rgb, factor)` function and creates different shades of the original colors.
>* **drawColorSelectors()**  Draws the color selector circles on top of the color wheel, indicating the chosen colors.

>* **getChoosenShades()** Retrieves the RGB color values of the selected shades from the canvas.
>* **setMode(mode)** Sets the color scheme mode and generates the corresponding `hitRectangles` for the color selectors.
>* **hexToRgb(hexCode)** Converts a hexadecimal color code to an RGB object. `required by adjustShade`
>* **adjustShade(rgb, factor)** Adjusts the shade of an RGB color by a given factor.

#### Event Listeners

>* **reCalculateSizes()** Recalculates sizes and positions of elements when the window is resized.
>* **mouseDownHandler()** Handles the `mousedown` event, checking if a hit rectangle is clicked and initiating the drag behavior.
>* **mouseMoveHandler()** Handles the `mousemove` event, updating the color selectors' positions based on mouse movement.
>* **mouseUpHandler()** Handles the `mouseup` and `mouseleave` events, ending the drag behavior.