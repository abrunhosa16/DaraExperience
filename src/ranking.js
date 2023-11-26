const createCell = (text) => {
    const cell = document.createElement("td");
    cell.innerHTML = text;
    return cell;
 }

   export function createRanking(data) {
    const rank = document.getElementById("rank");
        const tbody = document.createElement("tbody");

        if (data === undefined) {}
        else {
            const label = document.createElement("tr");
            label.append(createCell("Nick"), createCell("Victories"), createCell("Games"), createCell("Precision"));
            tbody.appendChild(label);
            
            data.forEach((player) => {
                const row = document.createElement("tr");
                row.append(createCell(player.nick), createCell(player.victories), createCell(player.games), createCell(player.victories/player.games * 100));
                tbody.appendChild(row);
            })
    
            rank.appendChild(tbody);}

    }





