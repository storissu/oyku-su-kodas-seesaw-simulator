let currentWeight = 0;
let rightWeight = 0;
let leftWeight = 0;
let leftTorque = 0;
let rightTorque = 0;
let tiltAngle = 0;
let previewCircle;
let previewLine;
let isDropping = false;
let dropHistory = JSON.parse(localStorage.getItem("dropHistory")) || [];
//you can only click and drop weight in the clickable area
const clickableArea = document.querySelector(".plank");

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

//necessary calculations for drop operation
function calculateDrop(mouseX, size, targetTiltAngle = tiltAngle) {
  const plankElement = document.querySelector(".plank");
  const pivotElement = document.querySelector(".pivot");
  const pivotRect = pivotElement.getBoundingClientRect();
  const plankRect = plankElement.getBoundingClientRect();
  const clickableAreaRect = clickableArea.getBoundingClientRect();

  const center = clickableAreaRect.left + clickableAreaRect.width / 2;
  const previewHeight = pivotRect.top - 150; //ball is dropped from preview ball and it was put 150px above the plank in the generatePreviewCircle() function
  const angleRad = (targetTiltAngle * Math.PI) / 180; //to determine the slope
  const halfPlank = plankElement ? plankElement.offsetWidth / 2 : 0;
  const temp_dx = mouseX - center;
  const dx = Math.max(-halfPlank, Math.min(halfPlank, temp_dx));
  const plank_x = halfPlank + dx; //location according to the planks left side
  const dropLocation = getDropLocation(plankElement, plank_x, size);
  const dropLocation_x = dropLocation.x;
  const dropLocation_y = dropLocation.y;
  const previewLineEnd_Y = dropLocation.y + size / 2;

  return {
    previewHeight,
    dropLocation_y,
    previewLineEnd_Y,
    dx,
    plank_x,
    dropLocation_x,
  };
}

//to find where to add the ball on the plank(.plank) according to the calculations that was done in calculateDrop() function
function getDropLocation(plankElement, plank_x, size) {
  const probeBall = document.createElement("div");
  probeBall.className = "placed-ball";
  probeBall.style.width = `${size}px`;
  probeBall.style.height = `${size}px`;
  probeBall.style.left = `${plank_x}px`;
  probeBall.style.top = "0";
  probeBall.style.visibility = "hidden";
  plankElement.appendChild(probeBall);

  const rect = probeBall.getBoundingClientRect();
  probeBall.remove();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
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
  const size = Math.log(currentWeight + 1) * 17;
  previewCircle.style.width = `${size}px`;
  previewCircle.style.height = `${size}px`;
  return size;
}

function addWeightVisualization(ballElement, weight, size) {
  const labelSize = Math.max(8, Math.min(14, size * 0.34)); //adjust fontsize according to ball size
  let label = ballElement.querySelector(".ball-label");
  if (!label) {
    label = document.createElement("span");
    label.className = "ball-label";
    ballElement.appendChild(label);
  }
  label.textContent = `${weight}kg`;
  label.style.fontSize = `${labelSize}px`;
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
  const size = updateCircleSize();
  addWeightVisualization(previewCircle, currentWeight, size);
  const { previewHeight, previewLineEnd_Y, dropLocation_x, dx } = calculateDrop(
    mouseX,
    size,
  );

  //adding distance visualization
  const label_size = Math.max(8, Math.min(14, size * 0.34)); //adjust fontsize according to ball size
  let distance_label = previewCircle.querySelector(".distance-label");
  if (!distance_label) {
    distance_label = document.createElement("span");
    distance_label.className = "distance-label";
    previewCircle.appendChild(distance_label);
  }
  distance_label.textContent = `${dx.toFixed(1)}px`;
  distance_label.style.fontSize = `${label_size}px`;
  //distance label end

  previewCircle.style.left = `${dropLocation_x}px`;
  previewCircle.style.top = `${previewHeight}px`;

  previewLine.style.left = `${dropLocation_x}px`;
  previewLine.style.top = `${previewHeight}px`;
  previewLine.style.height = `${previewLineEnd_Y - previewHeight}px`;
}

//puts a ball on the plank according to the calculations
function putBallOnPlank(plank_x, color, size, weight) {
  const plankElement = document.querySelector(".plank");
  if (!plankElement) return;
  const ball = document.createElement("div");
  const limit_plankX = Math.max(0, Math.min(plankElement.offsetWidth, plank_x)); //to prevent the ball from going outside

  ball.className = "placed-ball";
  ball.style.backgroundColor = color;
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;
  ball.style.left = `${limit_plankX}px`;
  ball.style.top = "0";
  addWeightVisualization(ball, weight, size);
  ball.dataset.weight = String(weight);
  plankElement.appendChild(ball);
}

function dropAnimation(clickX, weight, color, onComplete) {
  const size = Math.log(weight + 1) * 17;
  const { previewHeight, dropLocation_y, plank_x, dropLocation_x } =
    calculateDrop(clickX, size);
  const fallingBall = document.createElement("div");

  fallingBall.className = "preview-circle";
  fallingBall.style.backgroundColor = color;
  fallingBall.style.width = `${size}px`;
  fallingBall.style.height = `${size}px`;
  fallingBall.style.left = `${dropLocation_x}px`;
  fallingBall.style.top = `${previewHeight}px`;
  fallingBall.style.display = "block";
  fallingBall.style.transition = "top 360ms ease-in";
  addWeightVisualization(fallingBall, weight, size);
  document.body.appendChild(fallingBall);

  requestAnimationFrame(() => {
    fallingBall.style.top = `${dropLocation_y}px`;
  });

  fallingBall.addEventListener(
    "transitionend",
    () => {
      fallingBall.remove();
      putBallOnPlank(plank_x, color, size, weight);
      if (typeof onComplete === "function") onComplete();
    },
    { once: true },
  );
}

//..............................................
//Local Storage Functions
//..............................................

function saveDropToHistory(weight, side, positionX) {
  const entry = {
    weight: weight,
    side: side, // left or right
    positionX: Math.round(positionX),
    time: new Date().toISOString(),
  };

  dropHistory.push(entry);

  localStorage.setItem("dropHistory", JSON.stringify(dropHistory));
  displayDropHistory();
}

function displayDropHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;

  list.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("dropHistory")) || [];

  history.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "history-row";

    row.innerHTML = `
      <span>${index + 1}</span>
      <span>${item.weight} kg</span>
      <span>${item.side}</span>
      <span>${item.positionX}px</span>
      <span>${new Date(item.time).toLocaleTimeString()}</span>
    `;

    list.appendChild(row);
  });
}
//..............................................
//Event Listeners for Clickable Area (The Plank(.plank))
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
    if (isDropping) return;

    const plankRect = clickableArea.getBoundingClientRect();
    const pivot = plankRect.left + plankRect.width / 2;
    const clickX = e.clientX;
    const distanceFromPivot = clickX - pivot;
    const { dx } = calculateDrop(e.clientX, updateCircleSize());

    //the preview wasnt updating itself until the ball is dropped so these temp variables for hold the values then update preview so the current values dont get lost
    const temp_currentWeight = currentWeight;
    const temp_currentColor = previewCircle.style.backgroundColor;
    let side;
    if (distanceFromPivot < 0) {
      side = "left";
      leftWeight += temp_currentWeight;
      leftTorque += calculateTorque(
        temp_currentWeight,
        Math.abs(distanceFromPivot),
      );
    } else {
      side = "right";
      rightWeight += temp_currentWeight;
      rightTorque += calculateTorque(
        temp_currentWeight,
        Math.abs(distanceFromPivot),
      );
    }
    const nextTiltAngle = calculateTiltAngle(leftTorque, rightTorque);

    displayInfo();
    previewCircle.style.backgroundColor = generateColor();
    updatePreview(clickX);

    isDropping = true;
    dropAnimation(clickX, temp_currentWeight, temp_currentColor, () => {
      tiltAngle = nextTiltAngle;
      changePlankTiltVisual(tiltAngle);
      saveDropToHistory(temp_currentWeight, side, dx);
      isDropping = false;
    });
  });

  window.addEventListener("scroll", () => {
    previewCircle.style.display = "none";
    previewLine.style.display = "none";
  });
}
document.addEventListener("DOMContentLoaded", () => {
  initializeInfo();
  generateEventListeners();
  displayDropHistory();
});
