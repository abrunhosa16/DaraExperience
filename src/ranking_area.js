import Component from "./component.js";
import SizeInput from "./misc_components/size_input.js";

const createCell = (text) => {
  const cell = document.createElement("td");
  cell.innerHTML = text;
  return cell;
};

function createRanking(data) {
  if (data === undefined) {
    const error = document.createElement("p");
    error.innerHTML = "Failed to load table.";
    return error;
  }

  if (data.length === 0) {
    const no_data = document.createElement("p");
    no_data.innerHTML = "There are yet to be a ranking for this width and height.";
    return no_data;
  }
  
  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  const label = document.createElement("tr");
  label.append(
    createCell("Nick"),
    createCell("Victories"),
    createCell("Games"),
    createCell("Precision")
  );
  tbody.appendChild(label);

  data.forEach((player) => {
    const row = document.createElement("tr");
    row.append(
      createCell(player.nick),
      createCell(player.victories),
      createCell(player.games),
      createCell((player.victories / player.games) * 100)
    );
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
}

export default class rankingArea extends Component {
  static createElements() {
    const size_input = new SizeInput();
    const p = document.createElement("p");
    p.appendChild(size_input.el());

    const ranking = document.createElement("div");

    const base = document.createElement("div");
    base.append(p, ranking);
    return { size_input, base, ranking };
  }

  constructor(api) {
    const { size_input, base, ranking } = rankingArea.createElements();

    super(base);

    api.ranking(5, 6).then((data) => {
      console.log(data);
      ranking.appendChild(createRanking(data));
    });

    size_input.set_on_change_callback((dimensions) => {
      if (dimensions !== null) {
        api.ranking(...dimensions).then((data) => {
          console.log(data);
          ranking.innerHTML = "";
          ranking.appendChild(createRanking(data));
        });
      }
    });
  }
}
