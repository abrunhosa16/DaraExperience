import crypto from "crypto";
import fs from "fs/promises";

export function hashPass(password) {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  const hashValue = hash.digest("hex");
  return hashValue;
}

const randomString = (len) => {
  return Math.random()
    .toString(36)
    .substring(2, len + 2);
};

export async function validAuthentication(username, hashValue) {
  const file = await fs.open("./data/register.txt");
  for await (const line of file.readLines()) {
    const space = line.indexOf("␝");
    if (line.substring(0, space) === username) {
      if (line.substring(space + 1) === hashValue) {
        return true;
      } else {
        return false;
      }
    }
  }
  return undefined;
}

async function addRegist(username, hashValue) {
  const content = `${username}␝${hashValue}\n`;
  await fs.appendFile("./data/register.txt", content);
}

export async function register(username, hashValue) {
  const valid = await validAuthentication(username, hashValue);
  if (valid === undefined) {
    addRegist(username, hashValue);
    return true;
  }

  return valid;
}
