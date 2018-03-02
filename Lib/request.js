"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/**
 * Read JSON from a remote host
 * @param {string} uri
 * @returns {Promise}
 */
var readJson = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(uri) {
    var res;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return request(uri);

          case 2:
            res = _context.sent;
            return _context.abrupt("return", new Promise(function (resolve, reject) {
              contentType = res.headers["content-type"];
              var rawData = "";
              if (!/^application\/json/.test(contentType)) {
                return reject(new Error(`Invalid content-type (${uri}).\n` + `Expected application/json but received ${contentType}`));
              }
              res.setEncoding("utf8");
              res.on("data", function (chunk) {
                // downloaded / total
                return rawData += chunk;
              });
              res.on("end", function () {
                try {
                  resolve(JSON.parse(rawData));
                } catch (e) {
                  reject(e);
                }
              });
            }));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function readJson(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Download file
 * @param {string} srcUri
 * @param {string} targetDir
 * @param {function} onProgress
 * @returns {Promise}
 */


var download = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(srcUri, targetDir, onProgress) {
    var res, filename, filepath;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return request(srcUri);

          case 2:
            res = _context2.sent;
            filename = getFilename(srcUri);
            filepath = join(targetDir, filename);
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              var length = 0;
              res.on("data", function (chunk) {
                length += chunk.length;
                onProgress(length, parseInt(res.headers['content-length']));
              });
              res.pipe(fs.createWriteStream(filepath));
              res.on("end", function () {
                onProgress(length, length);
                resolve(filepath);
              });
            }));

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function download(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var http = require("http"),
    https = require("https"),
    url = require("url"),
    fs = require("fs"),
    _require = require("path"),
    join = _require.join;

/**
 * Extract file name from a download URI
 * @param {string} uri
 * @returns {string}
 */
function getFilename(uri) {
  var _url$parse$pathname$s = url.parse(uri).pathname.split(`/`).reverse(),
      _url$parse$pathname$s2 = _slicedToArray(_url$parse$pathname$s, 1),
      filename = _url$parse$pathname$s2[0];

  return filename;
}

/**
 * Make HTTP request
 * @private
 * @param {string} uri
 * @returns {Promise}
 */
function request(uri) {
  var driver = url.parse(uri).protocol === "https:" ? https : http;
  return new Promise(function (resolve, reject) {
    return driver.get(uri, function (res) {
      var statusCode = res.statusCode;
      var error = false;

      // handle redirect
      if (statusCode > 300 && statusCode < 400 && res.headers.location) {
        var redirectUri = res.headers.location;
        res.resume();
        return request(redirectUri).then(function (res) {
          resolve(res);
        }, function (e) {
          reject(e);
        });
      }

      if (statusCode !== 200) {
        error = new Error(`Request Failed (${uri}).\n` + `Status Code: ${statusCode}`);
      }

      if (error) {
        // consume response data to free up memory
        res.resume();
        return reject(error);
      }
      return resolve(res);
    }).on("error", function (e) {
      reject(new Error(`Cannot read (${uri}).\n${e.message}`));
    });
  });
}

exports.readJson = readJson;
exports.download = download;