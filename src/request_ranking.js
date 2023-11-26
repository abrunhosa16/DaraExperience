import { GROUP, SERVER_URL } from "./index.js";


export async function getRanking(rows, columns) {
    const url = SERVER_URL + "/ranking";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        group: GROUP,
        size:{rows:rows , columns: columns}
      }),
    });

    if (response.ok) {
        const data = await response.json();
        return data.ranking; 
    } else {
      throw "I dont know whats is happening wasn't suppose";
    }
  }
