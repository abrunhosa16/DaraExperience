import Component from "./component.js"
import SizeInput from "./misc_components/size_input.js"

export default class rankingArea extends Component{

    static createElements() {
        const button = new SizeInput();
        const submit_button = document.createElement("button");
        submit_button.innerHTML = "Submit!";
        const div_area = document.createElement("div");
        const p = document.createElement("p");
        p.append(button.el(), submit_button);

        div_area.append(p);
        return div_area;
    }

    constructor() {
        const div = rankingArea.createElements();

        super(
            div
        );
    }
}