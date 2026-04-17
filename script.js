let currentWeight = 0;
let rightWeight = 0;
let leftWeight = 0;
let newCursor;

function initializeInfo() {
  let currentWeight = 0;
  let rightWeight = 0;
  let leftWeight = 0;
  let newCursor;

  displayInfo();
}
//color palette is used instead of random color generation because of the UX consistency
function generateColor() {
  const color_palette = [
    "#ff69b4cb",
    "#ff85c2c4",
    "#ff99ccba",
    "#ff4da698",
    "#ffb6d9d3",
    "#fffebebc",
    "#b9e6ffbe",
    "#c2f8c5d3",
    "#9ac8e1c0",
  ];

  return color_palette[Math.floor(Math.random() * color_palette.length)];
}

function generateRandomWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

function calculateTorque(weight, distance) {
  return weight * distance;
}
function calculateTiltAngle(leftTorque, rightTorque) {
  return Math.max(-30, Math.min(30, (rightTorque - leftTorque) / 10));
}

function displayInfo() {
  const rightWeightElement = document
    .getElementById("right-weight")
    .querySelector(".info-text");

  const leftWeightElement = document
    .getElementById("left-weight")
    .querySelector(".info-text");

  const nextWeightElement = document
    .getElementById("next-weight")
    .querySelector(".info-text");

  if (leftWeight === null || rightWeight === null || nextWeightElement === null)
    return;

  currentWeight = generateRandomWeight();
  rightWeightElement.textContent = `${rightWeight} kg`;
  leftWeightElement.textContent = `${leftWeight} kg`;
  nextWeightElement.textContent = `${currentWeight} kg`;
}

//size of the cursor is calculated according to the weight
function updateCursorSize() {
  if (!newCursor) return;
  const size = Math.log(currentWeight + 1) * 30;
  newCursor.style.width = `${size}px`;
  newCursor.style.height = `${size}px`;
}

//cursor changes to a circle when it comes to the seesaw area
function changeCursor() {
  const seesaw = document.querySelector(".seesaw");
  newCursor = document.createElement("div");
  newCursor.className = "cursor-circle";
  document.body.appendChild(newCursor);

  newCursor.style.backgroundColor = generateColor();

  updateCursorSize(newCursor);

  seesaw.addEventListener("mouseenter", () => {
    document.body.style.cursor = "none";
    newCursor.style.display = "block";
  });

  seesaw.addEventListener("mouseleave", () => {
    document.body.style.cursor = "default";
    newCursor.style.display = "none";
  });

  seesaw.addEventListener("mousemove", (e) => {
    newCursor.style.left = `${e.x}px`;
    newCursor.style.top = `${e.y}px`;
  });

  seesaw.addEventListener("click", (e) => {
    const seesawRect = seesaw.getBoundingClientRect();
    const seesawCenterX = seesawRect.left + seesawRect.width / 2;
    const clickX = e.clientX;

    if (clickX < seesawCenterX) {
      leftWeight += currentWeight;
    } else {
      rightWeight += currentWeight;
    }

    displayInfo();

    newCursor.style.backgroundColor = generateColor();
    updateCursorSize(newCursor);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initializeInfo();
  changeCursor();
});
