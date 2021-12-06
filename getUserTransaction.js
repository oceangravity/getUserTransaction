'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function(inputStdin) {
    inputString += inputStdin;
});

process.stdin.on('end', function() {
    inputString = inputString.split('\n');

    main();
});

function readLine() {
    return inputString[currentLine++];
}



/*
 * Complete the 'getUserTransaction' function below.
 *
 * The function is expected to return an INTEGER_ARRAY.
 * The function accepts following parameters:
 *  1. INTEGER uid
 *  2. STRING txnType
 *  3. STRING monthYear
 *
 *  https://jsonmock.hackerrank.com/api/transactions/search?userId=
 */

const https = require('https');

const records = [];

const getPage = (uid, txnType, page) => {
  return new Promise((resolve) => {
    https.get(
      `https://jsonmock.hackerrank.com/api/transactions/search?userId=${uid}&txnType=${txnType}&page=${page}`,
      (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          resolve(JSON.parse(data));
        });
      }
    );
  });
};

const getAllPages = async (uid, txnType, monthYear) => {
  let allData = [];
  let morePagesAvailable = true;
  let currentPage = 0;

  while (morePagesAvailable) {
    currentPage++;
    let { data, total_pages } = await getPage(uid, txnType, currentPage);
    const dateParts = monthYear.split('-');
    const firstDay = new Date(
      Date.UTC(Number(dateParts[1]), Number(dateParts[0]) - 1, 1, 0, 0, 0, 0)
    ).getTime();
    const lastDay = new Date(
      Date.UTC(Number(dateParts[1]), Number(dateParts[0]), 0, 23, 59, 59, 999)
    ).getTime();

    data = data.filter(
      (item) => item.timestamp >= firstDay && item.timestamp <= lastDay
    );

    for (index in data) {
      allData.push(data[index]);
    }
    morePagesAvailable = currentPage < total_pages;
  }

  return allData;
};

const normalizeAmount = (amount) => Number(amount.replace(/[^0-9.-]+/g, ''));

const getAverage = (data) => {
  const qty = data.length;
  const amountSum = data
    .map((item) => normalizeAmount(item.amount))
    .reduce((a, b) => a + b, 0);
  return qty ? amountSum / qty : 0;
};

const getUserTransaction = async (uid, txnType, monthYear) => {
  const data = await getAllPages(uid, txnType, monthYear);
  const average = getAverage(data);
  const output = data
    .filter((item) => average < normalizeAmount(item.amount))
    .map((item) => item.id)
    .sort((a, b) => a - b);
  console.log(output.length ? output : [-1]);
};

getUserTransaction(4, 'debit', '02-2019');

async function main() {
    const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

    const uid = parseInt(readLine().trim(), 10);

    const txnType = readLine();

    const monthYear = readLine();

    const result = await getUserTransaction(uid, txnType, monthYear);

    ws.write(result.join('\n') + '\n');

    ws.end();
}
