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
                            try {
                                var zip = new AdmZip(archiveFile);
                                var entries = zip.getEntries();
                                if (entries && entries.length > 0) {
                                    var entryCount = entries.length;
                                    var currentCount = 0;
                                    onProgress(0, entryCount);
                                    for (var index = 0; index < entries.length; index++) {
                                        var entry = entries[index];
                                        onProgress(index + 1, entryCount);
                                        zip.extractEntryTo(entry, extractDest, true, true);
                                    }
                                    // entries.forEach(function (entry,index) {
                                    //     // currentCount++;
                                    //     zip.extractEntryTo(entry, extractDest, true, true);
                                    //     onProgress(index + 1, entryCount);
                                    // });
                                    resolve();
                                } else {
                                    onProgress(100, 100);
                                    resolve();
                                }
                            } catch (error) {
                                onProgress(1, 1);
                                reject(error);
                            }
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

var AdmZip = require('adm-zip');
var fs = require('fs');

module.exports = decompressZip;