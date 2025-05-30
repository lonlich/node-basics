import {
  log,
  warn,
  table,
  //formatPrice,
} from "./js/utils.js";

const fs = require('fs');

fs.readFile('test.txt', (err, data) => {
    if (err) {
        log('err!');
        return;
    } else {
        log(`data: ${data}`);
    }
})