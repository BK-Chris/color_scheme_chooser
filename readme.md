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

# ColorWheel Class Documentation

The `ColorWheel` class provides an interactive color wheel visualization and selection tool within a canvas element.

## Constructor

* `canvasElement`: (required) The HTML canvas element where the color wheel will be drawn.
* `numberOfShades`: (optional, default 6) The number of color shades to generate.
* `colorSchemeMode`: (optional, default "monochromatic") The color scheme to use ("monochromatic", "analogous", "complementary", "split-complementary", "triadic", "tetradic", "square").

## Properties

* `mouseDown`: (read/write) Indicates whether the mouse button is currently pressed.
* `dragAllowed`: (read/write) Indicates whether dragging is allowed.
* `cWidth`: (read/write) The width of the canvas.
* `cHeight`: (read/write) The height of the canvas.
* `canvasMidX`: (read-only) The x-coordinate of the canvas center.
* `canvasMidY`: (read-only) The y-coordinate of the canvas center.
* `minRadius`: (read-only) The minimum radius of the color wheel.
* `currentPosition`: (read/write) The current mouse position.
* `currentShade`: (read/write) The currently selected shade.
* `numberOfShades`: (read-only) The number of shades in the color wheel.
* `colorSchemeMode`: (read-only) The current color scheme mode. Use `setColorSchemeMode()` to change it.
* `hitRectangles`: (read-only) An array of `Rectangle` objects representing the clickable color selector areas.

## Methods

* `setColorSchemeMode(mode)`: Sets the color scheme mode.
* `refresh()`: Redraws the color wheel.
* `getChoosenShades()`: Returns an array of RGB color strings representing the selected shades.
* `hightLightHitRectangles(color)`: Highlights the hitboxes (color selector rectangles) with the specified color. Might be useful for debugging.

## Events

* `colorChanged`: Dispatched on the canvas element whenever the colors on the color wheel are modified (e.g., by dragging).

## Usage

```html
<form id="choose_mode">
    <label for="modes">Choose a selection mode</label>
    <select name="modes" id="modes">
        <option value="monochromatic">Monochromatic</option>
        <option value="analogous">Analogous</option>
        <option value="complementary">Complementary</option>
        <option value="split-complementary">Split-Complementary</option>
        <option value="triadic">Triadic</option>
        <option value="tetradic">Tetradic</option>
        <option value="square">Square</option>
    </select>
</form>
<div id="canvas_container">
    <canvas id="canvas">
    </canvas>
</div>
<ul id="choosen_colors">
</ul>
```

```javascript
const colorWheel = new ColorWheel(document.getElementById("canvas"), 8);
const colorListContainer = document.getElementById("choosen_colors");
const form = document.getElementById("choose_mode");

colorWheel._c.addEventListener("colorChanged", fillColorList);
form.addEventListener("input", (event) => {
    event.preventDefault();
    const modes = Array.from(document.getElementById("modes").children);
    colorWheel.setColorSchemeMode(modes.find((mode) => mode.selected).value);
});

fillColorList();

function fillColorList() {
    const choosenShades = colorWheel.getChoosenShades();
    colorListContainer.innerHTML = "";
    choosenShades.forEach(shade => {
        const liItem = document.createElement("li");
        liItem.style.background = shade;
        liItem.innerText = shade;
        colorListContainer.appendChild(liItem);
    });
}
```