import chalk from "chalk";
import { postApiCall } from "../constants/apiCall.js";
import Table from "cli-table";
const table = new Table({
  chars: {
    top: "═",
    "top-mid": "╤",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╧",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╟",
    mid: "─",
    "mid-mid": "┼",
    right: "║",
    "right-mid": "╢",
    middle: "│",
  },
});
import { Parser } from "json2csv";
import { spinner } from "../constants/ora.js";
const animation = spinner();
import { errorLog, writeLog } from "../commands/debug.js";

export const secretView = async (vault, path, format) => {
  animation.text = "Getting data, Please wait";
  animation.color = "yellow";
  animation.start();
  const response = await postApiCall(path, vault);
  animation.text = "";
  animation.stop();
  console.log(response);
  if (response.response.data.message != undefined) {
    if (response.response.data.message == "") {
      animation.text = chalk.bold.redBright(
        `${response.response.data.status} : ${response.response.data.error} at ${response.response.data.path}`
      );
    } else {
      animation.text = chalk.bold.redBright(
        `${response.response.data.errorCode} : ${response.response.data.message} at ${path}`
      );
    }
    animation.fail();
    const error = errorLog;
    error.command = `britive secret view ${vault} ${path} -f ${format}`;
    error.response = `response.response.data.errorCode} : ${response.response.data.message} at ${path}`;
    error.time = new Date().toString();
    writeLog(error);
  } else outputView(response.value, format);
};

function outputView(response, format) {
  if (format == "table") {
    tableFormat(response, format);
  } else if (format == "csv") {
    csvFormat(response, format);
  } else {
    jsonFormat(response, format);
  }
}

function tableFormat(data) {
  table.push(["User Name", "URL", "Password"]);
  table.push([data.username, data.url, data.password]);
  animation.succeed();
  console.log(chalk.bold.greenBright(table.toString()));
}

function csvFormat(data) {
  const json2csvParser = new Parser();
  const csv = json2csvParser.parse(data);
  animation.succeed();
  console.log(chalk.bold.yellowBright(csv));
}

function jsonFormat(data) {
  animation.text = chalk.bold.cyanBright(JSON.stringify(data, null, 2));
  animation.succeed();
}
