

const createCell = (text) => {
  const cell = document.createElement("td");
  cell.innerHTML = text;
  return cell;
};

export function createRanking(data) {
  if (!data || data.length === 0) {
    const p = document.createElement("p");
    p.innerHTML = "there is not a ranking of this size yet";
    return p;
  }

  const tbody = document.createElement("tbody");
  const label = document.createElement("tr");
  label.append(
    createCell("Nick"),
    createCell("Victories"),
    createCell("Games"),
    createCell("Precision")
  );
  tbody.appendChild(label);

  //console.log(data);
  //const order = orderRank(data);
  //console.log(order);
  //this.data = orderRank(data);

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

  const table = document.createElement("table");
  table.appendChild(tbody);
  return table;
}
