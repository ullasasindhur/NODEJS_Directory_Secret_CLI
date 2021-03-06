import fs from "fs";
import path from "path";
import secretResponse from "../constants/responses.js";

export const viewSecret = (request, response) => {
  const vault = request.query.vault;
  const secret = request.query.path;
  if (!fs.existsSync(path.join("/", vault))) {
    response.send(`The Vault "${vault}" doesn't exists`);
  }
  const location = path.join("/", vault, secret);
  if (!fs.existsSync(location)) {
    response.send(`The secret "${secret}" in  Vault "${vault}" doesn't exists`);
  }
  const values = readFile(location);
  if (values.length == undefined) {
    const output = secretResponse.errorResponse;
    output.route = "/secret/view";
    output.secret = values;
    response.send(output);
  } else {
    const output = secretResponse.secretResponse;
    if (output.value.length != 0) output.value = [];
    values.forEach((value) => {
      output.value.push(value);
    });
    response.send(output);
  }
};

const readFile = (path) => {
  try {
    const data = fs.readFileSync(path, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return error;
  }
};
