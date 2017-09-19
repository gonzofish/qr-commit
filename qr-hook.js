'use latest';

const FtpClient = require('ftp');
import { toDataURL as qrDataUrl } from 'qrcode';

module.exports = (context, callback) =>
  qrDataUrl(context.data.compare, (error, url) => {
    if (!error) {
      upload(url, context, () => {
        callback(null, `Success!`);
      });
    } else {
      callback(null, `Error: ${ error }`);
    }
  });

const generateQR = (compare) => new Promise((resolve, reject) => {
  qrDataUrl(compare, (error, url) => {
    if (error) {
      reject(error);
    } else {
      resolve(url);
    }
  });
});

const upload = (qrCode, context, callback) => {
  const client = new FtpClient();

  client.on('ready', () => {

    client.end();
    callback();
  });

  client.connect({
    host: context.data.FTP_HOST,
    password: context.data.FTP_PASS,
    user: context.data.FTP_USER
  });
};
