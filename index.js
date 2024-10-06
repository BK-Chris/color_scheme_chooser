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