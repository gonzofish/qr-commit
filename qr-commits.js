'use latest';

import { promisifyAll } from 'bluebird';
import * as mysql from 'mysql';

module.exports = (context, request, response) => {
    switch (request.method) {
        case 'GET':
            return handleGet(context, response);
        default:
            return sendJson(response, 400, { error: 'Method not implemented' });
    }
};

const handleGet = (context, response) => {
    const dbSetup = getDbSetup(context.data);
    const dbConnection = mysql.createConnection(dbSetup);
    const db = promisifyAll(dbConnection);
    let promise;

    if (context.data.commit) {
        promise = getSingleCommit(db, context.data.commit);
    } else if (context.data.repo) {
        promise = getRepoCommits(db, context.data.repo);
    } else {
        promise = getAllCommits(db);
    }

    promise.then((data) => sendJson(response, 200, data))
        .catch((error) => sendJson(response, 400, { error }))
        .finally(() => dbConnection.end());
};

const getSingleCommit = (db, commit) =>
    db.queryAsync('SELECT * FROM commits WHERE commit_url = ?', [commit])
        .then((commit) => ({ commit }));

const getRepoCommits = (db, repoUrl) =>
    db.queryAsync('SELECT * FROM commits WHERE repo_url = ? ORDER BY pushed_at DESC', [repoUrl])
        .then((commits) => ({ commits }));

const getAllCommits = (db) =>
    db.queryAsync('SELECT * FROM commits ORDER BY pushed_at DESC')
        .then((commits) => ({ commits }));

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

const sendJson = (response, code, message) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(message));
    response.end();
};
