"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * Remove a directory with content
 * @param {string} dir
 */
var remove = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(dir) {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fs.removeSync(dir);

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function remove(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * 过滤node_modules文件夹的copy
 * @param {string} src 源路径
 * @param {string} dest 目标路径
 */


/**
 * Copy dir
 * @param {string} from
 * @param {string} to
 * @param {FileDescriptor} log
 * @returns {Promise}
 */
var copy = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(from, to, log) {
    var isFilter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              fs.writeSync(log, `copy "${from}" "${to}"\n`, "utf-8");
              var options = { dereference: true };
              if (isFilter) {
                options.filter = filterFunc;
              }
              fs.copy(from, to, options, function (err) {
                if (err) {
                  fs.writeSync(log, `ERROR: ${err}\n`, "utf-8");
                  return reject(err);
                }
                resolve();
              });
            }));

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function copy(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Launch detached process
 * @param {string} runnerPath
 * @param {string[]} argv
 * @param {string} cwd
 * @param {string} logPath
 * @returns {Promise}
 */


var launch = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(runnerPath, argv, cwd, logPath) {
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve, reject) {
              var log = fs.openSync(logPath, "a"),
                  child = spawn(runnerPath, argv, {
                timeout: 4000,
                detached: true,
                cwd
              });

              child.stdout.on("data", function (data) {
                fs.writeSync(log, `${data}`, "utf-8");
              });

              child.stderr.on("data", function (data) {
                fs.writeSync(log, `ERROR: ${data}`, "utf-8");
              });

              child.on("error", function (e) {
                fs.writeSync(log, ["ERROR:", e, "\r\n"].join(" "), "utf-8");
                reject(e);
              });

              child.unref();
              resolve();
              //setTimeout(resolve, 500);
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function launch(_x6, _x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require("fs-extra"),
    path = require("path"),
    _require = require("child_process"),
    spawn = _require.spawn;
/**
  * Remove trailing slash
  * @param {string} dir
  * @returns {string}
  */
function rtrim(dir) {
  return dir.replace(/\/$/, "");
}function filterFunc(src, dest) {
  var srcObj = path.parse(src);
  if (srcObj && srcObj.name === 'node_modules') {
    return false;
  }
  return true;
}

exports.launch = launch;
exports.rtrim = rtrim;
exports.copy = copy;
exports.remove = remove;