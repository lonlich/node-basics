import {
  log,
  warn,
  table,
  block,
  // formatPrice,
} from './js/utils.js';

import fs from 'fs';
import { access } from 'fs/promises';
import { constants } from 'fs';
import { readFile } from 'fs/promises';
import axios, { Axios } from 'axios';
import http from 'node:http';
import url from 'node:url';
import EventEmitter from 'node:events';
const eventEmitter = new EventEmitter();
import { upperCase } from 'upper-case';
import formidable from 'formidable';
import express from 'express';
const app = express();

//CONSTANTS

const PORT = 3000;

app.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('<h1>Hi</h1>');
});

