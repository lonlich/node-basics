import {
  log,
  warn,
  table,
  block,
  //formatPrice,
} from "./js/utils.js";

import fs from 'fs/promises';
import axios, { Axios } from 'axios';
import http from 'node:http';
import url from 'node:url';
import EventEmitter from 'node:events';
const eventEmitter = new EventEmitter();

const body = 'ABIRVALG'

//Формат куки: 'Set-Cookie': `name=value; HttpOnly; Secure; SameSite=Strict`

/**
 * Creates an HTTP server that responds to all requests with a simple HTML page.
 * 
 * Response headers include:
 * - Custom header 'Test-Header'
 * - Content-Type set to 'text/html; charset=utf-8'
 * - CORS headers allowing all origins and common methods/headers
 * - Cache control headers to prevent caching
 * - 'X-Powered-By' set to 'Node.js'
 * 
 * The response body contains a UTF-8 encoded HTML message in Russian and English.
 * 
 * Logs success or error after sending the response.
 * 
 * @param {import('http').IncomingMessage} req - The incoming HTTP request.
 * @param {import('http').ServerResponse} res - The HTTP response object.
 */ 

//устанавливает куки с secure-флагами
function setCookieWithSecureFlags(name, value) {
  return `${name}=${value}; HttpOnly; Secure; SameSite=Strict`
}

//создает сервер, в колбеке - обработка каждого входящего запроса. Req - запрос, Res - ответ
const server = http.createServer((req, res) => {
  res.setHeader('Test-Header', 'herro');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Set-Cookie': [
      `${setCookieWithSecureFlags('sessionId', '100')}`,
      'theme=dark',
      'id=69'
    ],
    'location': '/new-location'
  });

  if (req.url === '/user') {
    res.write('this is user profile page');
  }

  if (req.url === '/loser') {
    res.write('this is user loser page');
  }
  
  res.end(
    `<div class="container">
    <meta charset="UTF-8">
    <h1>Hello World!</h1>
    <p>Это мой первый сервер на Node.js</p>
    </div>`,
    (err) => {
      if (err) {
        log("Ошибка при отправке ответа:", err);
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal Server Error");
      } else {
        
      }
    }
  );
  log(req.headers.cookie)
});

const port = 3000;
//запуск сервера на localhost:3000
server.listen(port, () => {
  log(`Сервер запущен на порту ${port}, открыть в браузере: http://localhost:${port}`);
});


// const server = http.createServer((req, res) => {
//   res.setHeader('Content-Type', 'text/html');
//   res.setHeader('X-Foo', 'bar');
//   res.writeHead(200, { 'Content-Type': 'text/plain' });
//   res.end('ok');
// });



// Create a local server to receive data from
// const server = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'application/json' });
//   res.end(JSON.stringify({
//     data: 'Hello World!',
//   }));
// });

// server.listen(8000);


//TODO: включить автодополнение яункций

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

//async позволяет использовать внутри await - симулировать синхронный код из асинхронных операций
async function fetchImgsAwait(count) {
  //формат async - try, catch (ошибок)
  try {
    log('about to fetch')
    for (let index = 0; index < count; index++) {

      //следующие операции выполняются только после получения результата await
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      log('ended fetch, begin res.json')

      //fetch возвращает Promise, с которым нельзя работать напрямую. Его нужно превратить в подходящий формат через .json()
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


//то же самое, что и в async, можно сделать через цепочку .then .then .catch
function fetchImgsChain(count) {

  const promises = [];

  for (let index = 0; index < count; index++) {
    
    //fetch возвращает Promise
    const promise  = fetch('https://dog.ceo/api/breeds/image/random')
      //затем этот Promise парсится через .json()
      .then(res => {
        log('ended fetch, begin res.json')
        return res.json();
      })
      //затем ответ (в данном случае - URL картинки) через response.message добавляется в хранилище
      .then((jsonRes) => {
        log(`Добавляю ${index} картинку в массив`);
        imgs.push(jsonRes.message)
      })
      .catch(err => {
        log(`ОШИБКА: ${err}`)
      })

    promises.push(promise);
  }

  //Promise.all принимает массив промисов и выполняется только после того, как все они завершились
  Promise.all(promises)
  .then(() => {
    log('показываю imgs');
    table(imgs);
  })
  .catch(err => warn(err))
}

//метод post - добавляет информацию на сервер
async function postAndPut() {
  axios
    .post('https://jsonplaceholder.typicode.com/posts', {
      title: 'Hello',
      body: 'World',
      userId: Date.now()
    })
    .then(res => log(res.data))
    .catch(err => log(err.message));
  
  axios
  .delete('https://jsonplaceholder.typicode.com/posts/1')
  .then(res => log(res.status))
  .catch(err => log(`НЕ ОБНОВИЛ: ${err.message}`));
}

// postAndPut();



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

//метод get - получает информацию с сервера
axios
  .get('https://dog.ceo/api/breeds/image/random')
  .then(res => {
    // log(`Status code: ${res.status}`);
    // log(res.data.message);
    })
  .catch(err => warn(`Error message: ${err.message}`));



// log(new Date())

// const time = new Date().toLocaleString();
// log(time)



