import fs from "fs";

function writeFile(path, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

function createDirectory(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

// client/pages/users
function newResourcePage(name) {
  const pageDir = `client/pages/${name}`;
  const componentDir = `${pageDir}/components`;
  const formDir = `${pageDir}/components/${name}Form`;
  const listDir = `${pageDir}/components/${name}List`;
  const listQueryDir = `${listDir}/queries`;
}
