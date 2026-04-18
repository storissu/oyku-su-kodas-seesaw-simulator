let currentWeight = 0;
let rightWeight = 0;
let leftWeight = 0;
let leftTorque = 0;
let rightTorque = 0;
let tiltAngle = 0;
let previewCircle;

function initializeInfo() {
  currentWeight = 0;
  rightWeight = 0;
  leftWeight = 0;
  leftTorque = 0;
  rightTorque = 0;
  tiltAngle = 0;
  previewCircle;

  displayInfo();
}
//color palette is used instead of random color generation because of the UX consistency
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

function generateRandomWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

function calculateTorque(weight, distance) {
  return weight * distance;
}

function calculateTiltAngle(leftTorque, rightTorque) {
  const diff = rightTorque - leftTorque;
  const maxTorque = 5000; // test ederek ayarla

  return Math.max(-30, Math.min(30, (diff / maxTorque) * 30));
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

function updateCircleSize() {
  if (!previewCircle) return;
  const size = Math.log(currentWeight + 1) * 25;
  previewCircle.style.width = `${size}px`;
  previewCircle.style.height = `${size}px`;
}

function clickableArea() {
  const clickablePlank = document.querySelector(".plank-container");
  previewCircle = document.createElement("div");
  previewCircle.className = "preview-circle";
  document.body.appendChild(previewCircle);

  const previewLine = document.createElement("div");
  previewLine.className = "preview-line";
  document.body.appendChild(previewLine);

  previewCircle.style.backgroundColor = generateColor();

  updateCircleSize();

  clickablePlank.addEventListener("mouseenter", () => {
    document.body.style.cursor = "none";
    previewCircle.style.display = "block";
    previewLine.style.display = "block";
  });

  clickablePlank.addEventListener("mouseleave", () => {
    document.body.style.cursor = "default";
    previewCircle.style.display = "none";
    previewLine.style.display = "none";
  });

  clickablePlank.addEventListener("mousemove", (e) => {
    previewCircle.style.left = `${e.x}px`;
    previewCircle.style.top = `${e.y}px`;

    const rect = clickablePlank.getBoundingClientRect();

    const mouseX = e.clientX;
    const plankTop = rect.top;

    const previewHeight = 100;

    previewCircle.style.left = `${mouseX}px`;
    previewCircle.style.top = `${plankTop - previewHeight}px`;

    previewLine.style.left = `${mouseX}px`;
    previewLine.style.top = `${plankTop - previewHeight}px`;
    previewLine.style.height = `${previewHeight}px`;
  });

  clickablePlank.addEventListener("click", (e) => {
    const seesawRect = clickablePlank.getBoundingClientRect();
    const pivot = seesawRect.left + seesawRect.width / 2;
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

    console.log(clickX);
    console.log(pivot);
    tiltAngle = calculateTiltAngle(leftTorque, rightTorque);
    displayInfo();
    previewCircle.style.backgroundColor = generateColor();
    updateCircleSize();
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initializeInfo();
  clickableArea();
});
