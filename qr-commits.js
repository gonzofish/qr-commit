'use latest';

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
    const sql = 'SELECT * FROM commits ORDER BY pushed_at DESC';

    dbConnection.query(sql, (error, commits) => {
        if (error) {
            sendJson(response, 400, { error });
        } else {
            sendJson(response, 200, { commits });
        }
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

const sendJson = (response, code, message) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(message));
    response.end();
};
