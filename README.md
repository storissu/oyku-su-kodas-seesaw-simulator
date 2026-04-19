### Live Demo At: https://storissu.github.io/Seesaw-Simulation/


# Seesaw Physics Simulator
This project is an interactive physics-based seesaw simulation built with pure JavaScript, HTML, and CSS.
Users can drop weights on a plank and observe real-time torque, balance, and tilt calculations based on simplified physics rules.

## Core Features (Completed)
* Real-time seesaw tilt simulation (After each new object is dropped, the seesaw rebalances smoothly based on the 
new torque calculation.)
* Physics-based torque calculations
* Interactive weight dropping system(Objects appear exactly where the user clicks on the seesaw.)
* Drop history tracking
* Local storage persistence
* Displaying the total weight on each side in the UI. 
● The seesaw should respond continuously to new clicks and remain in motion as the 
balance changes. 

## Additional Improvements
* Balance hint system (Tells user to where to drop the weight in order to rebalance the plank)
* Visual preview of drop location (A visual scale or grid to show distance from pivot)
* A smal weight indicator showing the value of each dropped object
* Sound effects for interactions
* Undo & reset & pause functionality

## Design Strategy

### State Management Design
I used a single array called state_storage which stores all dropped objects. Each object contains:
```
state_storage.push({
  weight,
  side,
  torqueArmPx,
  plankX,
  color,
  time: new Date().toISOString()
});
```
This design makes the system fully deterministic, the UI is always derived from this state.
This made it very easy to implement undo, reset, and history features.


### Updating UI
UI updates are derived from stack storage. All the changes pushed to the state_storage so visualization of UI is updating according to the contents of the state storage.

```
//to make sure that ux of the simulator is up to date when the local storage changes
function updateVisualizationFromStorage() {
  const hoverText = document.querySelector("#tip .hover-text");
  hoverText.textContent = calculateBalance();

  const new_values = takeCalculationsFromStorage(state_storage);
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
```

### Drop System & User Interaction

The most interactive part of the project is the drop mechanism.
When the user clicks on the plank, I calculate:

* which side the weight is dropped on
* distance from pivot
* torque contribution

Then I simulate the falling animation before actually updating the state.
This is handled by the dropAnimation function, which visually moves the ball down and triggers physics updates after the animation ends.
A key design decision here was separating visual simulation from state update timing, to make the experience feel more natural.



### Local Storage

To make the simulation persistent, I used LocalStorage.
This allows all dropped objects and system state to persist even after refreshing the page.


LocalStorage was used to:

* Save system state between refreshes
* Restore dropped objects and physics state


The system saves both:
```
current weight
full state array
localStorage.setItem(
  "seesawstorage",
  JSON.stringify({ state_storage, currentWeight })
);
```

## Trade-offs & Limitations
* The system uses DOM-based positioning This makes development simpler, but can cause slight inconsistencies across screen sizes.
* The physics model is simplified. It does not simulate inertia or continuous motion — only static torque-based balance.

## AI Assistance
* Solving some css position adjustment
* Solving some scroll bugs
* Debugging JavaScript logic issues
* Improving structure of physics calculations
* Suggesting modular function breakdowns
