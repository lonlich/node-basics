import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs';
import axios, { Axios } from 'axios';


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

const imgs = [];

async function fetchImgsAwait(count) {
  try {
    log('about to fetch')
    for (let index = 0; index < count; index++) {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      log('ended fetch, begin res.json')
      const jsonRes = await res.json();
      log('добавляю картинку в массив...')
      imgs.push(jsonRes.message)
    }
    table(imgs);

  } 
  catch (error) {
    log('ОШИБКА')
    log(error)
  }
}

function mainAwait() {
  log('===BEGIN====')
  fetchImgsAwait(5);
  log('делаем UI-стафф');
  log('делаем всякое');
}

//mainAwait();

function fetchImgsChain(count) {

  const promises = [];

  for (let index = 0; index < count; index++) {
    
    const promise  = fetch('https://dog.ceo/api/breeds/image/random')
      .then(res => {
        log('ended fetch, begin res.json')
        return res.json();
      })
      .then((jsonRes) => {
        log(`Добавляю ${index} картинку в массив`);
        imgs.push(jsonRes.message)
      })
      .catch(err => {
        log(`ОШИБКА: ${err}`)
      })

    promises.push(promise);
  }

  Promise.all(promises)
  .then(() => {
    log('показываю imgs');
    table(imgs);
  })
  .catch(err => warn(err))
}

// log('===BEGIN====')
// fetchImgsChain(5);
// log('делаем UI-стафф');
// log('делаем всякое');

// fetch('https://dog.ceo/api/breeds/image/random')
//   .then(res => res.blob())
//   .then(blob => log(blob))

  //TODO: узнать про finally


  /* 
1. file request sent
2. file received, begin processing (takes time)
3. "File received, processing..."
4. UI updated
5. "File has been processed"
*/

axios
  .get('https://dog.ceo/api/breeds/image/random')
  .then(res => {
    log(`Status code: ${res.status}`);
    log(res.data.message);
  })
  .catch(err => warn(`Error message: ${err.message}`))