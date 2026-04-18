let currentWeight = 0;
let rightWeight = 0;
let leftWeight = 0;
let leftTorque = 0;
let rightTorque = 0;
let tiltAngle = 0;
let previewCircle;
let previewLine;
//you can only click and drop weight in the clickable area
const clickableArea = document.querySelector(".plank-container");

//.................................
//Calculations
//.................................
function calculateTorque(weight, distance) {
  return weight * distance;
}

function calculateTiltAngle(leftTorque, rightTorque) {
  const diff = rightTorque - leftTorque;
  const maxTorque = 5000; // test ederek ayarla

  return Math.max(-30, Math.min(30, (diff / maxTorque) * 30));
}

function generateRandomWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

//Color palette is used instead of random color generation because of the UX consistency
function generateColor() {
  const color_palette = [
    "#ff69b4",
    "#ff85c2",
    "#ff99cc",
    "#ff4da6",
    "#ffb6d9",
    "#fffebe",
    "#b9e6ff",
    "#c2f8c5",
    "#9ac8e1",
  ];

  return color_palette[Math.floor(Math.random() * color_palette.length)];
}

//.................................
//Visual updates and adjustments
//.................................
function initializeInfo() {
  currentWeight = 0;
  rightWeight = 0;
  leftWeight = 0;
  leftTorque = 0;
  rightTorque = 0;
  tiltAngle = 0;
  previewCircle;
  previewLine;

  displayInfo();
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

  const tiltAngleElement = document
    .getElementById("tilt-angle")
    .querySelector(".info-text");

  if (
    leftWeightElement === null ||
    rightWeightElement === null ||
    nextWeightElement === null ||
    tiltAngleElement === null
  )
    return;

  currentWeight = generateRandomWeight();
  rightWeightElement.textContent = `${rightWeight} kg`;
  leftWeightElement.textContent = `${leftWeight} kg`;
  nextWeightElement.textContent = `${currentWeight} kg`;
  tiltAngleElement.textContent = `${tiltAngle.toFixed(1)}° `;
}

function changePlankTiltVisual(tiltAngle) {
  const plank = document.querySelector(".plank-container");
  plank.style.transform = `rotate(${tiltAngle}deg)`;
}

function updateCircleSize() {
  if (!previewCircle) return;
  const size = Math.log(currentWeight + 1) * 25;
  previewCircle.style.width = `${size}px`;
  previewCircle.style.height = `${size}px`;
}

function generatePreview() {
  previewCircle = document.createElement("div");
  previewCircle.className = "preview-circle";
  document.body.appendChild(previewCircle);

  previewLine = document.createElement("div");
  previewLine.className = "preview-line";
  document.body.appendChild(previewLine);

  previewCircle.style.backgroundColor = generateColor();
  updateCircleSize();
}

function updatePreview(mouseX) {
  const pivotElement = document.querySelector(".pivot");
  const pivotRect = pivotElement.getBoundingClientRect();
  const plankRect = clickableArea.getBoundingClientRect();
  const pivotCenter = plankRect.left + plankRect.width / 2;

  const plankTop = plankRect.top;
  const pivotTop = pivotRect.top;

  const previewHeight = pivotTop - 100;

  const angleRad = (tiltAngle * Math.PI) / 180;

  const dx = mouseX - pivotCenter;
  const y_OnPlank = pivotTop + dx * Math.tan(angleRad);

  previewCircle.style.left = `${mouseX}px`;
  previewCircle.style.top = `${previewHeight}px`;

  previewLine.style.left = `${mouseX}px`;
  previewLine.style.top = `${previewHeight}px`;
  previewLine.style.height = `${y_OnPlank - previewHeight}px`;
}

//..............................................
//Event Listeners for Clickable Area
//..............................................
function generateEventListeners() {
  generatePreview();
  clickableArea.addEventListener("mouseenter", () => {
    document.body.style.cursor = "none";
    previewCircle.style.display = "block";
    previewLine.style.display = "block";
  });

  clickableArea.addEventListener("mouseleave", () => {
    document.body.style.cursor = "default";
    previewCircle.style.display = "none";
    previewLine.style.display = "none";
  });

  clickableArea.addEventListener("mousemove", (e) => {
    updatePreview(e.clientX);
  });

  clickableArea.addEventListener("click", (e) => {
    const plankRect = clickableArea.getBoundingClientRect();
    const pivot = plankRect.left + plankRect.width / 2;
    const clickX = e.clientX;
    const distanceFromPivot = clickX - pivot;

    if (distanceFromPivot < 0) {
      leftWeight += currentWeight;
      leftTorque += calculateTorque(currentWeight, Math.abs(distanceFromPivot));
    } else {
      rightWeight += currentWeight;
      rightTorque += calculateTorque(
        currentWeight,
        Math.abs(distanceFromPivot),
      );
    }
    tiltAngle = calculateTiltAngle(leftTorque, rightTorque);
    changePlankTiltVisual(tiltAngle);

    displayInfo();
    previewCircle.style.backgroundColor = generateColor();
    updateCircleSize();
    updatePreview(clickX);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initializeInfo();
  generateEventListeners();
});
