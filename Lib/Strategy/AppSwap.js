"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

/**
 * Restart and launch detached swap
 * @returns {Promise}
 */
var restartToSwap = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var extraArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var _options, execDir, executable, updateDir, backupDir, logPath, tpmUserData, app, args;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _options = this.options, execDir = _options.execDir, executable = _options.executable, updateDir = _options.updateDir, backupDir = _options.backupDir, logPath = _options.logPath, tpmUserData = join(nw.App.dataPath, "swap"), app = join(updateDir, executable), args = [`--user-data-dir=${tpmUserData}`, `--swap=${execDir}`, `--bak-dir=${backupDir}`].concat(extraArgs);

            if (!IS_OSX) {
              _context.next = 6;
              break;
            }

            _context.next = 4;
            return launch("open", ["-a", app, "--args", ...args], updateDir, logPath);

          case 4:
            _context.next = 8;
            break;

          case 6:
            _context.next = 8;
            return launch(app, args, updateDir, logPath);

          case 8:
            nw.App.quit();

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function restartToSwap() {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Do swap
 */
var swap = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var _options2, executable, backupDir, execDir, updateDir, logPath, log;

    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _options2 = this.options, executable = _options2.executable, backupDir = _options2.backupDir, execDir = _options2.execDir, updateDir = _options2.updateDir, logPath = _options2.logPath, log = fs.openSync(logPath, "a");

            if (!IS_OSX) {
              _context2.next = 6;
              break;
            }

            _context2.next = 4;
            return copy(updateDir, join(execDir, executable), log);

          case 4:
            _context2.next = 8;
            break;

          case 6:
            _context2.next = 8;
            return copy(updateDir, execDir, log);

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function swap() {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * REstart after swap
 * @returns {Promise}
 */


var restart = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var extraArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

    var _options3, execDir, executable, updateDir, logPath, app, appPath, resourcePath;

    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _options3 = this.options, execDir = _options3.execDir, executable = _options3.executable, updateDir = _options3.updateDir, logPath = _options3.logPath, app = join(execDir, executable);

            if (!IS_OSX) {
              _context3.next = 8;
              break;
            }

            appPath = process.cwd().replace('/Contents/Resources/app.nw', '');
            resourcePath = process.cwd().replace("app.nw", "restart.sh");

            fs.writeFile(resourcePath, "sleep 1; open " + appPath, function () {
              fs.chmod(resourcePath, 0o770, function () {
                cp.spawn(resourcePath, ["&"], { detached: true });
                nw.App.closeAllWindows();
                nw.App.quit();
              });
            });
            return _context3.abrupt("return");

          case 8:
            _context3.next = 10;
            return launch(app, [], execDir, logPath);

          case 10:
            nw.App.quit();

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function restart() {
    return _ref3.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("path"),
    join = _require.join,
    fs = require("fs-extra"),
    _require2 = require("../utils"),
    launch = _require2.launch,
    copy = _require2.copy,
    _require3 = require("../env"),
    swapFactory = _require3.swapFactory,
    IS_OSX = _require3.IS_OSX;

var cp = require('child_process');

function getBakDirFromArgv(argv) {
  var raw = argv.find(function (arg) {
    return arg.startsWith("--bak-dir=");
  });
  if (!raw) {
    return false;
  }
  return raw.substr(10);
}

/**
 * Is it a swap request
 * @returns {Boolean}
 */
function isSwapRequest() {
  var raw = this.argv.find(function (arg) {
    return arg.startsWith("--swap=");
  });
  if (!raw) {
    return false;
  }

  this.options.execDir = raw.substr(7);
  this.options.backupDir = getBakDirFromArgv(this.argv) || this.options.backupDir;
  return true;
}

exports.restartToSwap = restartToSwap;
exports.restart = restart;
exports.swap = swap;
exports.isSwapRequest = isSwapRequest;