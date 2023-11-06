import BoardArea from "./board/area.js";

("use strict");

function main() {
  console.log("hello world!");

  const area_target = document.getElementById("board-area");

  const area = new BoardArea();
  area_target.parentElement.replaceChild(area.el(), area_target);

  const openInstructionsButton = document.getElementById("openInstructions");
  const instructionsModal = document.getElementById("instructionsModal");
  const closeButton = document.querySelector(".close");

  openInstructionsButton.addEventListener("click", function () {
    instructionsModal.style.display = "block";
  });

  closeButton.addEventListener("click", function () {
    instructionsModal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === instructionsModal) {
      instructionsModal.style.display = "none";
    }
  });

  const loginButton = document.querySelector(".start-button");
  const registrationForm = document.getElementById("registration-form");
  const closeFormButton = document.getElementById("closeFormButton");

  loginButton.addEventListener("click", function () {
    registrationForm.style.display = "block";
  });

  closeFormButton.addEventListener("click", function () {
    registrationForm.style.display = "none";
  });
}

main();
