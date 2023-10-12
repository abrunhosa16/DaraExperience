"use strict";

export const showElement = (el) => el.classList.remove("hidden");
export const hideElement = (el) => el.classList.add("hidden");

export const markAsSelected = (element) => {
  element.classList.add("sel-button");
  element.disabled = true;
};
export const markAsUnselected = (element) => {
  element.classList.remove("sel-button");
  element.disabled = false;
};
