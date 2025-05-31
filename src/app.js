import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs';


// fs.readFile('src/test.txt', (err, data) => {
//     if (err) log(err);
//     // log(`data: ${data}`);
// });

// const targetFile = 'src/message1.txt'
// const messageText = 'HELLO WORLD'

// fs.writeFile(targetFile, messageText, (err) => {
//     if (err) throw err;
//     console.log('The file has been saved!');

//     fs.readFile(targetFile, (err, data) => {
//     if (err) log(err);
//     log('начинаю читать файл')
//     log(`${targetFile}'s contents are ${data}`)
// });
// });

async function fileRequestSim() {
  async function processFile(ms) {
    block(ms, () => log('Processing file...'));
  }
  
  async function fetchFile(ms) {
    block(ms, () => log('Waiting for server response...'));
  }
  
  log('=== BEGIN ===')
  
  //sending request
  log('File request sent!');
  const test = await fetchFile(3000, () => log('Waiting for server response...'));
  test.then(log(test));
  log('File received');
  
  //processing
  // log('Begin processing...');
  // const processedFile = await processFile(2000);
  // log('Finished file processing!');
  
  
  //doing stuff
  log('Updating UI');
  log('Doing background stuff');
  
  //showing result
  // log(`Processed file: ${processedFile}`);
  
  log('=== END ===');
}

// fileRequestSim();

// const delay = new Promise((resolve, reject, ms) => {
  
// })

// log(delay)

log('начинаю fetch')

async function fetchAPI() {
  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const jsonRes = await res.json();
    table(jsonRes);
  } catch (error) {
    log('ОШИБКА')
    log(error)
  }
}
log('закончил fetch')

fetchAPI();



  /* 
1. file request sent
2. file received, begin processing (takes time)
3. "File received, processing..."
4. UI updated
5. "File has been processed"
*/