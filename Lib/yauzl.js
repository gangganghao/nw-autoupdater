'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
var decompressZip = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(archiveFile, extractDest, onProgress) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        return _context.abrupt('return', new Promise(function (resolve, reject) {
                            yauzl.open(archiveFile, { lazyEntries: true }, function (err, zipfile) {
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
                                    var extraFilePath = path.join(extractDest, entry.fileName);
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
                        }));

                    case 1:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function decompressZip(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var yauzl = require('yauzl');
var fs = require('fs');

var _require = require("stream"),
    Transform = _require.Transform;

var path = require('path');
function mkdirp(dir, cb) {
    if (dir === ".") return cb();
    fs.stat(dir, function (err) {
        if (err == null) return cb(); // already exists

        var parent = path.dirname(dir);
        mkdirp(parent, function () {
            process.stdout.write(dir.replace(/\/$/, "") + "/\n");
            fs.mkdir(dir, cb);
        });
    });
}
module.exports = decompressZip;