const yauzl = require('yauzl');
const fs = require('fs');
const { Transform } = require("stream");
const path = require('path');
/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
async function decompressZip(archiveFile, extractDest, onProgress) {
    return new Promise((resolve, reject) => {
       yauzl.open(archiveFile, { lazyEntries: true }, (err, zipfile) => {
            if (err) {
                onProgress(100, 100);
                reject(err);
            }
            var totalBytes = zipfile.entryCount;
            var byteCount = 0;
            // track when we've closed all our file handles
            var handleCount = 0;
            function incrementHandleCount() {
                handleCount++;
            }
            function decrementHandleCount() {
                handleCount--;
                if (handleCount === 0) {
                    onProgress(totalBytes, totalBytes);
                    resolve();
                }
            }

            incrementHandleCount();
            zipfile.on("close", function () {
                decrementHandleCount();
            });
            zipfile.on("error", function (e) {
                onProgress(100, 100);
                reject(e);
            });
            zipfile.readEntry();
            zipfile.on("entry", function (entry) {
                var extraFilePath = path.join(extractDest,entry.fileName);
                byteCount++;
                if (/\/$/.test(entry.fileName)) {
                    // directory file names end with '/'
                    mkdirp(entry.fileName, function () {
                        if (err) {
                            onProgress(totalBytes, totalBytes);
                            reject(err);
                        }
                        zipfile.readEntry();
                    });
                } else {
                    // ensure parent directory exists
                    mkdirp(path.dirname(extraFilePath), function () {
                        zipfile.openReadStream(entry, function (err, readStream) {
                            if (err) {
                                onProgress(totalBytes, totalBytes);
                                reject(err);
                            }
                            // report progress through large files
                            
                            onProgress(byteCount, totalBytes);
                            var filter = new Transform();
                            filter._transform = function (chunk, encoding, cb) {
                                // byteCount += chunk.length;
                                cb(null, chunk);
                            };
                            filter._flush = function (cb) {
                                cb();
                                zipfile.readEntry();
                            };

                            // pump file contents
                            var writeStream = fs.createWriteStream(extraFilePath);
                            incrementHandleCount();
                            writeStream.on("close", decrementHandleCount);
                            readStream.pipe(filter).pipe(writeStream);
                        });
                    });
                }
            });
        });
    });
}
function mkdirp(dir, cb) {
    if (dir === ".") return cb();
    fs.stat(dir, function(err) {
      if (err == null) return cb(); // already exists
  
      var parent = path.dirname(dir);
      mkdirp(parent, function() {
        process.stdout.write(dir.replace(/\/$/, "") + "/\n");
        fs.mkdir(dir, cb);
      });
    });
  }
module.exports = decompressZip;