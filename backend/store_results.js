import fsp from "fs/promises";

async function dataRanking(group, nick, rows, cols) {
  const path = `./data/ranking/${group}/${rows}-${cols}.json`;
  const player = await nickEOnRank(nick, path);
  console.log(player);
}

// Function to know if the player is on rank (true) else add this player on rank if (0 games and 0 victories)
async function nickEOnRank(username, path) {
  fsp
    .readFile(path, "utf8")
    .then((data) => {
      const dados = JSON.parse(data.toString());
      for (const players of dados.ranking) {
        if (username === players.nick) {
          console.log(dados);
          return true;
        }
      }
      dados.ranking.push({ nick: username, victories: 0, games: 0 });
      dados.ranking.sort(
        (a, b) =>
          b.victories - a.victories ||
          b.victories / b.games - a.victories / a.games
      );
      fsp
        .writeFile(path, JSON.stringify(dados))
        .then(() => {})
        .catch(() => {});

      console.log(dados);
    })
    .catch(() => {});
}

//there are 3 possibilities for a player in game, user is winner, loser or draw

export async function winnerLoser(winning, losing, width, height) {
  const path = `./data/ranking/group/${width}-${height}.json`
  fsp
    .readFile(path, "utf8")
    .then((data) => {
      const dados = JSON.parse(data.toString());
      for (const players of dados.ranking) {
        if (players.nick === winning) {
          winning.victories++;
          winning.games++;
        }
        if(players.nick === losing) {
          losing.games++;
        }
      }
      dados.ranking.sort(
        (a, b) =>
          b.victories - a.victories ||
          b.victories / b.games - a.victories / a.games
      );

      fsp
        .writeFile(path, JSON.stringify(dados))
        .then(() => {} /* continuar */)
        .catch(() => {
          /* processar erro */
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

//Verify if players already are in ranking
// if not create a initial rank game : 0, victories: 0 ...
//wait for a winner if result == null game++1 for both
//otherwise winner game++1 victories ++1,  loser game ++1 victories keep,
//
