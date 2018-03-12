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

var unzip = require('unzip');
var fs = require('fs');

module.exports = decompressZip;