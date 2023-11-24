import Component from "../component.js";
import { hideElement, showElement } from "../css_h.js";

("use strict");

// Creates a hidden modal that can be opened or closed
export default class Modal extends Component {
  static createElements(close_button_text, content) {
    const close_button = document.createElement("button");
    close_button.innerHTML = close_button_text;
    close_button.classList.add("close-button");

    const modal_content = document.createElement("div");
    modal_content.classList.add("modal-content");
    modal_content.appendChild(content.el());
    modal_content.appendChild(close_button);

    const base = document.createElement("div");
    base.classList.add("modal", "hidden");
    base.appendChild(modal_content);

    return { base: base, close_button: close_button };
  }

  constructor(open_button_id, close_button_text, content) {
    const { base, close_button } = Modal.createElements(
      close_button_text,
      content
    );
    super(base);

    this.clickCloseModal = this.getClickCloseModalEvent(open_button_id);
    this.keyboardCloseModal = this.getKeyboardCloseModalEvent();

    // close modal on button click
    close_button.addEventListener("click", () => {
      this.close();
    });
  }

  open() {
    showElement(super.el());

    // Add event to document to close modal on click or Esc keyboard press
    window.addEventListener("click", this.clickCloseModal);
    window.addEventListener("keydown", this.keyboardCloseModal);
  }

  close() {
    hideElement(super.el());

    // Remove event to close modal (it's not needed anymore)
    window.removeEventListener("click", this.clickCloseModal);
    window.removeEventListener("keydown", this.keyboardCloseModal);
  }

  getClickCloseModalEvent(open_button_id) {
    return (e) => {
      // test if outside modal content and not clicking on opening button (or else it closes instantly)
      if (
        e.target.id != open_button_id &&
        !e.target.closest(".modal-content")
      ) {
        this.close();
      }
    };
  }

  getKeyboardCloseModalEvent() {
    return (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
  }
}
