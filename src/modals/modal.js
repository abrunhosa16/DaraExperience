import Component from "../component.js";
import { hideElement } from "../css_h.js";

("use strict");

class Modal extends Component {
  static createElements(close_button_text, content) {
    const close_button = document.createElement("button");
    close_button.innerHTML = close_button_text;
    close_button.classList.add("close-button");

    const modal_content = document.createElement("div");
    modal_content.classList.add("modal-content");
    modal_content.appendChild(content);
    modal_content.appendChild(close_button);

    const base = document.createElement("div");
    base.classList.add("modal", "hidden");
    base.appendChild(modal_content);

    return {base: base, close_button: close_button};
  }

  constructor(close_button_text, content, content_open_callback) {
    const {base, close_button} = Modal.createElements(close_button_text, content);
    super(base);

    this.document_close_fn = this.getDocumentCloseModalEvent();

    // close modal on button click
    close_button.addEventListener("click", this.close(this.document_close_fn));

    this.content_open_callback = content_open_callback;
    
  }

  open() {
    showElement(super.el());
    this.content_open_callback ?? this.content_open_callback();

    // Add event to document to close modal on click
    document.addEventListener("click", this.document_close_fn);
  }

  close() {
    hideElement(super.el());

    // Remove event to close modal on click (it's not needed anymore)
    document.removeEventListener("click", this.document_close_fn);
  }

  getDocumentCloseModalEvent() {
    const fnc = (off_login = (e) => {
      if (
        e.target.id != super.el().id &&
        !e.target.closest(".modal-content")
      ) {
        hideLoginModal(fnc);
      }
    });
    return fnc;
  }
}
