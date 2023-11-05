function adicionar() {
    let phuman = document.getElementById("human").innerText;
    phuman++
    let probot = document.getElementById("robot").innerText;
    probot++
    document.getElementById("human").innerText = phuman;
    document.getElementById("robot").innerText = probot;
  }
  