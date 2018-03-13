const unzip = require('node-unzip-2');
var fs = require('fs');
/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
async function decompressZip( archiveFile, extractDest, onProgress ) {
  return new Promise(( resolve, reject ) => {
      var zipFolder = unzip.Extract({ path: extractDest });
      zipFolder.on("error", function (err) {
        //   onProgress(100, 100);
          reject(err);
      });
      zipFolder.on("finish", function () {
        onProgress(100, 100);
        resolve();
      });
      var readSize = 0;
      var stat = fs.statSync(archiveFile);
      var stream = fs.createReadStream(archiveFile);
      stream.pipe(zipFolder);
      stream.on('data', function (buff) {
          readSize += buff.length;
          onProgress(readSize, stat.size);
      });
  });
}

module.exports = decompressZip;