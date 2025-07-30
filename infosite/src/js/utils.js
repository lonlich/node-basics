const isBrowser = typeof window !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

//capitalize the first char of a string
export function capitalizeFirstChar(input) {
  if (!input) {
    return "No string entered";
  }
  const firstChar = input.charAt(0).toUpperCase();
  const rest = input.slice(1).toLowerCase();
  const result = firstChar.concat(rest);
  return result;
}

//get the value of a clicked button
const getButtonValue = (e) => e.target.value;

//get random number from 0 to maxNumber - 1
export function random(maxNumber) {
  return Math.floor(Math.random() * maxNumber);
}

//check two arrays for equality
export function checkArrEquality(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

//check if a character an alphabet letter (true/false)
export function isAlphabetLetter(char) {
  return /^[a-zA-Z]$/.test(char);
}

//create Delete button
export function createDeleteButton(textContent, className = "delete-btn") {
  const deleteBtn = document.createElement("button");
  deleteBtn.className = className;
  deleteBtn.textContent = textContent;
  return deleteBtn;
}

// Media Breakpoints

// const desktop = window.matchMedia('(min-width: 1200px)');
// const tabletL = window.matchMedia('(min-width: 1024px) and (max-width: 1199px)'); //Tablet Landscape
// const tabletP = window.matchMedia('(min-width: 768px) and (max-width: 1023px)'); // Tablet Portrait
// const phoneL = window.matchMedia('(min-width: 440px) and (max-width: 767px)'); // Phone Large
// const phoneS = window.matchMedia('(max-width: 439px)'); // Phone Small
// const totalBlockMobileLayoutBreakpoint = window.matchMedia('(max-width: 600px)');

//utility functions

// export function log(label, message) {

//   if(!message) {
//     message = label;
//     label = '📋 Logger';
//   } 
//   console.log(`📋 ${label}:`);
//   console.table(message);
// }

export function block(ms, callback) {
  callback();
  const start = Date.now();
  while (Date.now() - start < ms) {
    //пустой цикл для блокировки потока
  }
  log(`${ms/1000} seconds passed`)
}
export function log(...args) {
  console.log('📋 Logger:\n', ...args);
  // console.log(...args);

}


export function warn(message) {
  console.warn(`⚠️ ${message}`);
}

export function table(label, data) {
  if(!data) {
    data = label;
    label = '📋 Log';
  } 
  console.log(`📋 ${label}:`);
  console.table(data);
}

export function isDesktop() {
  if (!isBrowser) return false;
  return window.matchMedia('(min-width: 1200px)');
}

export function isTabletL() {
  if (!isBrowser) return false;
  return window.matchMedia('(min-width: 1024px) and (max-width: 1199px)').matches;
}

export function isTabletP() {
  if (!isBrowser) return false;
  return window.matchMedia('(min-width: 768px) and (max-width: 1023px)').matches; 
}

export function isPhoneL() {
  if (!isBrowser) return false;
  return window.matchMedia('(min-width: 440px) and (max-width: 767px)').matches;
}

export function isPhoneP() {
  if (!isBrowser) return false;
  return window.matchMedia('(max-width: 439px)').matches;
}

export function pluralize(quantity, singular, plural) {
  return quantity === 1 ? singular : plural;
}

export function logArrayInline(arr, label = "Array Inline Output") {
  console.log(`📋 ${label}:`);
  console.log(arr.join(', '));
}

export function logArrayColumn(arr, label = "Array Column Output") {
  console.log(`📋 ${label}:`);
  console.log(arr.join('\n'));
}

export function logArrayList(arr, label = "Array List Output", formatter = (val, i) => `- ${val}`) {
  console.log(`📋 ${label}:`);
  arr.forEach((val, i) => {
    console.log(formatter(val, i));
  });
}

export function logArrayTable(arr, label = "Array Table Output", formatter = (val, i) => ({ Index: i + 1, Value: val })) {
  console.log(`📋 ${label}:`);
  console.table(arr.map(formatter));
}

export function checkKeysMatch(obj1, obj2, label1 = 'obj1', label2 = 'obj2') {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const missingIn2 = keys1.filter(key => !(key in obj2));
  const missingIn1 = keys2.filter(key => !(key in obj1));

  if (missingIn2.length === 0 && missingIn1.length === 0) {
    console.log(`✅ Ключи объектов "${label1}" и "${label2}" совпадают.`);
    return true;
  } else {
    if (missingIn2.length) {
      console.warn(`⚠️ Ключи из "${label1}", которых нет в "${label2}":`, missingIn2);
    }
    if (missingIn1.length) {
      console.warn(`⚠️ Ключи из "${label2}", которых нет в "${label1}":`, missingIn1);
    }
    return false;
  }
}

export function formatPrice(price) {
  if (typeof price === 'number') { return `$${price}`; }
  else { return price }
}

//измерение производительности
export function measure(label, fn) {
  const start = performance.now();

  const result = fn(); // выполняем код, результат сохраняем

  const end = performance.now();
  console.log(`⏱ ${label}: ${(end - start).toFixed(3)} ms`);

  return result; // возвращаем результат, если нужен
}

export async function fakeApiCall(delay) {
  return new Promise(resolve =>
    setTimeout(() => resolve('OK'), delay)
  );
}

export const now = new Date(Date.now());



