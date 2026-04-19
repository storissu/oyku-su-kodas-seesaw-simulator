let previewCircle; // visualization of ball higher from the plank
let previewLine; // a line that shows the predicted location of the ball that is to be dropped
let isDropping = false;

let currentWeight = 0;
let state_storage = []; // every information held here to use

//you cant click unless its on the plank(.plank)
const clickableArea = document.querySelector(".plank");

// takes data from local storage and loads it to the state_storage
function loadState() {
  try {
    const storage = localStorage.getItem("seesawstorage"); //state_storage and currentWeight value is assigned to the storage in JSON format
    if (!storage) {
      // if the storage is empty(nothing in localstorage) initalize the state_storage and generate a random weight
      state_storage = [];
      currentWeight = generateWeight();
      return;
    }
    const data = JSON.parse(storage); //storage was in json format so now it turned into an object (state_storage, currentWeight))

    // written to determine wheter state_storage is an array. if not, initalize empty.
    if (Array.isArray(data.state_storage)) {
      state_storage = data.state_storage;
    } else {
      if (Array.isArray(data)) {
        state_storage = data;
      } else {
        state_storage = [];
      }
    }
    if (typeof data.currentWeight === "number") {
      currentWeight = data.currentWeight;
    } else {
      currentWeight = generateWeight();
    }
  } catch {
    state_storage = [];
    currentWeight = generateWeight();
  }
}
//saving current status of the system to the local storage
function saveCurrentStateToLocalStorage() {
  localStorage.setItem(
    "seesawstorage",
    JSON.stringify({ state_storage, currentWeight }),
  );
}

//generates random number from 1 to 10 for weights
function generateWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

//to sum all the balls and apply the physic calculations to determine the planks latest situation according to the storage
function updateCalculationsFromStorage(state_storage) {
  let leftWeight = 0;
  let rightWeight = 0;
  let leftTorque = 0;
  let rightTorque = 0;
  for (const d of state_storage) {
    const torque = calculateTorque(d.weight, d.torqueArmPx);
    if (d.side === "left") {
      leftWeight += d.weight;
      leftTorque += torque;
    } else {
      rightWeight += d.weight;
      rightTorque += torque;
    }
  }
  const tiltAngle = calculateTiltAngle(leftTorque, rightTorque);
  return {
    leftWeight,
    rightWeight,
    leftTorque,
    rightTorque,
    tiltAngle,
  };
}

function addDropEvent(entry) {
  state_storage.push(entry);
  saveCurrentStateToLocalStorage();
  updateVisualizationFromStorage();
}

//when the local storage changes this function is used to make sure that ux of the simulator is up to date
function updateVisualizationFromStorage() {
  const new_values = updateCalculationsFromStorage(state_storage);
  changePlankTiltVisual(new_values.tiltAngle);

  //to put balls at the plank
  const plankElement = document.querySelector(".plank");
  if (!plankElement) return;
  plankElement.querySelectorAll(".placed-ball").forEach((el) => el.remove());
  for (const d of state_storage) {
    const size = Math.log(d.weight + 1) * 17;
    putBallOnPlank(d.plankX, d.color, size, d.weight);
  }
  //
  displayInfo(new_values);
  displayDropHistory();
}

//.................................
//Calculations
//.................................

function calculateTorque(weight, distance) {
  return weight * distance;
}

//formula from the document is used but sensibility was too low so maxTorque = 5000 is added
function calculateTiltAngle(leftTorque, rightTorque) {
  const diff = rightTorque - leftTorque;
  const maxTorque = 5000;

  return Math.max(-30, Math.min(30, (diff / maxTorque) * 30));
}

//color palette is using to maintain ux consistency
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

function calculateDrop(mouseX, size) {
  const plankElement = document.querySelector(".plank");
  const pivotElement = document.querySelector(".pivot");
  const pivotRect = pivotElement.getBoundingClientRect();
  const clickableAreaRect = clickableArea.getBoundingClientRect();

  const center = clickableAreaRect.left + clickableAreaRect.width / 2; //center of the plank
  const previewHeight = pivotRect.top - 150; //preview ball is placed 150px above the plank center
  const halfPlank = plankElement ? plankElement.offsetWidth / 2 : 0; //halff of the planks length in px
  const temp_dx = mouseX - center; //distance between the mouse and the center
  const dx = Math.max(-halfPlank, Math.min(halfPlank, temp_dx)); //distance between the mouse and the center(limited by the plank)
  const plank_x = halfPlank + dx; //distance between mouse and the most left side of the plank
  const dropLocation = getDropLocation(plankElement, plank_x, size);
  const dropLocation_x = dropLocation.x;
  const dropLocation_y = dropLocation.y;
  const previewLineEnd_Y = dropLocation.y + size / 2; //to end the preview line at the top of the plank

  return {
    previewHeight,
    dropLocation_y,
    previewLineEnd_Y,
    dx,
    plank_x,
    dropLocation_x,
  };
}

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

function displayInfo(physics) {
  let p;
  if (physics != null) {
    p = physics;
  } else {
    p = updateCalculationsFromStorage(state_storage);
  }
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

  rightWeightElement.textContent = `${p.rightWeight} kg`;
  leftWeightElement.textContent = `${p.leftWeight} kg`;
  nextWeightElement.textContent = `${currentWeight} kg`;
  tiltAngleElement.textContent = `${p.tiltAngle.toFixed(1)}° `;
}

function changePlankTiltVisual(angle) {
  const plank = document.querySelector(".plank-container");
  plank.style.transform = `rotate(${angle}deg)`;
}

function updateCircleSize() {
  if (!previewCircle) return;
  const size = Math.log(currentWeight + 1) * 17;
  previewCircle.style.width = `${size}px`;
  previewCircle.style.height = `${size}px`;
  return size;
}

//adding weight texts on the balls
function addWeightVisualization(ballElement, weight, size) {
  const labelSize = Math.max(8, Math.min(14, size * 0.34));
  let label = ballElement.querySelector(".ball-label");
  if (!label) {
    label = document.createElement("span");
    label.className = "ball-label";
    ballElement.appendChild(label);
  }
  label.textContent = `${weight}kg`;
  label.style.fontSize = `${labelSize}px`;
}

//generating preview to show predicted landing location of the ball
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

  const label_size = Math.max(8, Math.min(14, size * 0.34)); //for text size adjustment according to the weight
  let distance_label = previewCircle.querySelector(".distance-label");
  if (!distance_label) {
    distance_label = document.createElement("span");
    distance_label.className = "distance-label";
    previewCircle.appendChild(distance_label);
  }
  distance_label.textContent = `${dx.toFixed(1)}px`;
  distance_label.style.fontSize = `${label_size}px`;

  previewCircle.style.left = `${dropLocation_x}px`;
  previewCircle.style.top = `${previewHeight}px`;

  previewLine.style.left = `${dropLocation_x}px`;
  previewLine.style.top = `${previewHeight}px`;
  previewLine.style.height = `${previewLineEnd_Y - previewHeight}px`;
}

function putBallOnPlank(plank_x, color, size, weight) {
  const plankElement = document.querySelector(".plank");
  if (!plankElement) return 0;
  const ball = document.createElement("div");
  const limit_plankX = Math.max(0, Math.min(plankElement.offsetWidth, plank_x)); //to preventball from falling outside of the plank

  ball.className = "placed-ball";
  ball.style.backgroundColor = color;
  ball.style.width = `${size}px`;
  ball.style.height = `${size}px`;
  ball.style.left = `${limit_plankX}px`;
  ball.style.top = "0";
  addWeightVisualization(ball, weight, size);
  ball.dataset.weight = String(weight);
  plankElement.appendChild(ball);
  return limit_plankX;
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
      const plankElement = document.querySelector(".plank");
      const placedX = plankElement
        ? Math.max(0, Math.min(plankElement.offsetWidth, plank_x))
        : plank_x;
      if (typeof onComplete === "function") onComplete(placedX);
    },
    { once: true },
  );
}

function displayDropHistory() {
  const list = document.getElementById("history-list");
  if (!list) return;
  list.innerHTML = "";

  for (let i = 0; i < state_storage.length; i++) {
    const item = state_storage[i];
    const index = i;

    const row = document.createElement("div");
    row.className = "history-row";

    const spanIndex = document.createElement("span");
    spanIndex.textContent = index + 1;

    const spanWeight = document.createElement("span");
    spanWeight.textContent = item.weight + " kg";

    const spanSide = document.createElement("span");
    spanSide.textContent = item.side;

    const spanTorque = document.createElement("span");
    spanTorque.textContent = Math.round(item.torqueArmPx) + "px";

    const spanTime = document.createElement("span");
    spanTime.textContent = new Date(item.time).toLocaleTimeString();

    row.appendChild(spanIndex);
    row.appendChild(spanWeight);
    row.appendChild(spanSide);
    row.appendChild(spanTorque);
    row.appendChild(spanTime);

    list.appendChild(row);
  }
}

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
    const torqueArmPx = Math.abs(distanceFromPivot);

    //when click happens calculations made before the landing so these temp values are for values to dont get lost by that way the dropped ball has the same values as the preview ball
    const temp_currentWeight = currentWeight;
    const temp_currentColor = previewCircle.style.backgroundColor;
    const side = distanceFromPivot < 0 ? "left" : "right";

    const current = updateCalculationsFromStorage(state_storage);
    let updates;
    if (side === "left") {
      updates = {
        leftWeight: current.leftWeight + currentWeight,
        rightWeight: current.rightWeight,
        leftTorque:
          current.leftTorque + calculateTorque(currentWeight, torqueArmPx),
        rightTorque: current.rightTorque,
        tiltAngle: calculateTiltAngle(
          current.leftTorque + calculateTorque(currentWeight, torqueArmPx),
          current.rightTorque,
        ),
      };
    } else {
      updates = {
        leftWeight: current.leftWeight,
        rightWeight: current.rightWeight + currentWeight,
        leftTorque: current.leftTorque,
        rightTorque:
          current.rightTorque + calculateTorque(currentWeight, torqueArmPx),
        tiltAngle: calculateTiltAngle(
          current.leftTorque,
          current.rightTorque + calculateTorque(currentWeight, torqueArmPx),
        ),
      };
    }

    currentWeight = generateWeight();
    displayInfo(updates);

    previewCircle.style.backgroundColor = generateColor();
    updatePreview(clickX);
    //landing animations
    isDropping = true;
    dropAnimation(clickX, temp_currentWeight, temp_currentColor, (placedX) => {
      addDropEvent({
        weight: temp_currentWeight,
        side,
        torqueArmPx,
        plankX: placedX,
        color: temp_currentColor,
        time: new Date().toISOString(),
      });
      isDropping = false;
    });
  });

  window.addEventListener("scroll", () => {
    previewCircle.style.display = "none";
    previewLine.style.display = "none";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateVisualizationFromStorage();
  generateEventListeners();
});
