import BoardSizeInput from "./board/board_gen/size_input.js"
import Component from "./component.js"

export default class rankingArea extends Component{

    static createElements() {
        const button = new BoardSizeInput();
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