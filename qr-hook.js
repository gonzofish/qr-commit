'use latest';

import * as mysql from 'mysql';
import { toDataURL as qrDataUrl } from 'qrcode';

module.exports = (context, callback) => {
  const { data } = context;

  qrDataUrl(data.compare, (error, url) => {
    if (!error) {
      commitToDb(url, data, (message) => {
        callback(null, message);
      });
    } else {
      callback(null, `Error: ${ error }`);
    }
  });
};

const commitToDb = (qrCode, data, callback) => {
  const dbSetup = getDbSetup(data);
  const dbConnection = mysql.createConnection(dbSetup);
  const values = getValues(qrCode, data);
  const sql = 'INSERT INTO commits(qr_code, commit_url, owner_name, owner_avatar_url, owner_url, repo_url, pushed_at) VALUES(?, ?, ?, ? , ?, ?, ?)';

  console.log('Inserting QR commit');
  dbConnection.query(sql, values, (error) => {
    let message = '';

    if (error) {
      message = `Error: ${ error }`
      console.error(error);
    } else {
      message = 'Success!';
      console.log(message);
    }

    callback(message);
    dbConnection.end();
  });
};

const getDbSetup = (data) => {
  const {
    DB_HOST,
    DB_NAME,
    DB_PASS,
    DB_USER
  } = data;

  return {
    database: DB_NAME,
    host: DB_HOST,
    password: DB_PASS,
    user: DB_USER
  };
};

const getValues = (qrCode, data) => {
  const { head_commit, repository } = data;
  const { owner } = repository;

  return [
    qrCode,
    head_commit.url,
    owner.name,
    owner.avatar_url,
    owner.html_url,
    repository.html_url,
    repository.pushed_at
  ];
};
