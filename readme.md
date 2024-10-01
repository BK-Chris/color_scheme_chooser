# Color Scheme Chooser

This javascript application is made for the project called [elte_web_project]("https://github.com/BK-Chris/elte_web_project").

The static website with the application can be checked [here]("https://bk-chris.github.io/elte_web_project/pages/color_scheme.html") on my github pages.

-------------------

## Objective

To create an interactive color wheel, where you can choose the color(s) depending on which mode you choose.

## Methods

to be implemented...

// Implement dragging with mouseDown, mouseMove, let isDragging (boolean) mouseUp
// Define bounderies

// Drawing methods
- createColorWheel()
- createHandler(mode); // draggable with defined bounderies.
    Handlerers should define a list of points x and y (in case of multiple)
    return the color below the point

// Helper functions
- getPointerLocation()
- getHandlerPosition() // Define a "clickable" area for the handler