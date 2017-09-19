'use latest';

import * as bluebird from 'bluebird';
import * as mysql from 'mysql';
import { toDataURL as qrDataUrlRaw } from 'qrcode';

const qrDataUrl = bluebird.promisify(qrDataUrlRaw);

module.exports = (context, callback) => {
  const { data } = context;

  if (data.head_commit && data.head_commit.url) {
    qrDataUrl(data.head_commit.url)
      .then((url) => commitToDb(url, data))
      .then((message) => callback(null, message }))
      .catch((error) => callback(null, { error }));
  } else if (data.hook) {
    callback(null, { pong: `Looks like you want me to say "pong"` });
  } else {
    callback(null, { error: `Couldn't find a commit to work from!` });
  }
};

const commitToDb = (qrCode, data) => {
  const dbSetup = getDbSetup(data);
  const dbConnection = bluebird.promisifyAll(mysql.createConnection(dbSetup));
  const values = getValues(qrCode, data);
  const sql = 'INSERT INTO commits(qr_code, commit_url, owner_name, owner_avatar_url, owner_url, repo_url, pushed_at) VALUES(?, ?, ?, ? , ?, ?, ?)';

  return dbConnection.queryAsync(sql, values)
    .then(() => {
      console.info('Insert complete');
      return 'Success!';
    })
    .catch((error) => {
      console.error(error);
      return `Error: ${ error }`
    })
    .finally(() => dbConnection.end());
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
