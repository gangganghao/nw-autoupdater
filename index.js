"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var EventEmitter = require("events"),
    AppSwapStrategy = require("./Lib/Strategy/AppSwap"),
    ScriptSwapStrategy = require("./Lib/Strategy/ScriptSwap"),
    semver = require("semver"),
    os = require("os"),
    _require = require('fs'),
    lstatSync = _require.lstatSync,
    existsSync = _require.existsSync,
    _require2 = require("path"),
    join = _require2.join,
    basename = _require2.basename,
    dirname = _require2.dirname,
    parse = _require2.parse,
    unpackTarGz = require("./Lib/unpackTarGz"),
    unpackZip = require("./Lib/yauzl"),
    debounce = require("debounce"),
    _require3 = require("./Lib/request"),
    readJson = _require3.readJson,
    download = _require3.download,
    _require4 = require("./Lib/utils"),
    launch = _require4.launch,
    rtrim = _require4.rtrim,
    remove = _require4.remove,
    _require5 = require("./Lib/env"),
    PLATFORM_FULL = _require5.PLATFORM_FULL,
    swapFactory = _require5.swapFactory,
    getExecutable = _require5.getExecutable,
    UPDATE_DIR = _require5.UPDATE_DIR,
    EXEC_DIR = _require5.EXEC_DIR,
    BACKUP_DIR = _require5.BACKUP_DIR,
    LOG_PATH = _require5.LOG_PATH,
    ERR_INVALID_REMOTE_MANIFEST = "无效的清单数据",
    DEBOUNCE_TIME = 50,
    DEFAULT_OPTIONS = {
  executable: null, //可执行程序名字
  backupDir: BACKUP_DIR, //备份地址
  execDir: EXEC_DIR, //程序所在文件夹
  updateDir: UPDATE_DIR, //更新地址
  logPath: LOG_PATH,
  verbose: false,
  swapScript: null,
  strategy: "AppSwap", //AppSwap：app更新，ScriptSwap：重新安装
  accumulativeBackup: false //是否保留所有历史版本
};


var fs = require("fs-extra");
class AutoUpdater extends EventEmitter {
  /**
   * Create AutoUpdate
   * @param {Object} manifest
   * @param {Object} options
   */
  constructor(manifest) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    super();

    this.manifest = manifest;
    this.release = "";
    this.argv = nw.App.argv;
    this.remoteManifest = "";
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.options.backupDir += this.options.accumulativeBackup ? `_${Math.floor(Date.now() / 1000)}` : ``;
    this.options.execDir = rtrim(this.options.execDir);
    this.options.executable = this.options.executable || getExecutable(manifest.name);
    // Mixing up a chosen strategy
    Object.assign(this, this.options.strategy === "ScriptSwap" ? ScriptSwapStrategy : AppSwapStrategy);
  }
  /**
   * Download new version
   * @param {Object} packageUrl
   * @param {Object} options
   * @returns {Promise<string>}
   */
  download(packageUrl) {
    var _arguments = arguments,
        _this = this;

    return _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var _ref = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : { debounceTime: DEBOUNCE_TIME },
          debounceTime = _ref.debounceTime;

      var onProgress;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (packageUrl) {
                _context.next = 2;
                break;
              }

              throw new Error(`packageUrl can't be null, ${PLATFORM_FULL}`);

            case 2:
              onProgress = function onProgress(length, totalSize) {
                _this.emit("download", length, totalSize);
              };

              _context.prev = 3;

              remove(_this.options.updateDir);
              _context.next = 7;
              return download(packageUrl, os.tmpdir(), debounce(onProgress, debounceTime));

            case 7:
              return _context.abrupt("return", _context.sent);

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](3);
              throw new Error(`Cannot download package from ${packageUrl}`);

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, _this, [[3, 10]]);
    }))();
  }
  /**
   * Unpack downloaded version
   * @param {string} updateFile
   * @param {Object} options
   * @returns {Promise<string>}
   */
  unpack(updateFile) {
    var _arguments2 = arguments,
        _this2 = this;

    return _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      var _ref2 = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : { debounceTime: DEBOUNCE_TIME },
          debounceTime = _ref2.debounceTime;

      var isZipRe, isGzRe, onProgress, updateDir, newPath;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              isZipRe = /\.zip$/i, isGzRe = /\.tar\.gz$/i, onProgress = function onProgress(installFiles, totalFiles) {
                _this2.emit("install", installFiles, totalFiles);
              }, updateDir = _this2.options.updateDir;

              if (updateFile) {
                _context2.next = 3;
                break;
              }

              throw new Error("You have to call first download method");

            case 3:
              _context2.t0 = true;
              _context2.next = _context2.t0 === isGzRe.test(updateFile) ? 6 : _context2.t0 === isZipRe.test(updateFile) ? 15 : 24;
              break;

            case 6:
              _context2.prev = 6;
              _context2.next = 9;
              return unpackTarGz(updateFile, updateDir, debounce(onProgress, debounceTime));

            case 9:
              _context2.next = 14;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t1 = _context2["catch"](6);
              throw new Error(`Cannot unpack .tar.gz package ${updateFile}`);

            case 14:
              return _context2.abrupt("break", 26);

            case 15:
              _context2.prev = 15;
              _context2.next = 18;
              return unpackZip(updateFile, updateDir, debounce(onProgress, debounceTime));

            case 18:
              _context2.next = 23;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t2 = _context2["catch"](15);
              throw new Error(`Cannot unpack .zip package ${updateFile}: ${_context2.t2.message}`);

            case 23:
              return _context2.abrupt("break", 26);

            case 24:
              throw new Error("Release archive of unsupported type");

            case 26:

              //If extract zip in new folder
              newPath = join(updateDir, parse(updateFile).name);

              if (existsSync(newPath)) {
                if (lstatSync(newPath).isDirectory()) {
                  _this2.options.updateDir = newPath;
                }
              }

              return _context2.abrupt("return", updateDir);

            case 29:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this2, [[6, 11], [15, 20]]);
    }))();
  }

  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  isSwapRequest() {
    return false;
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  swap() {
    var _this3 = this;

    return _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              return _context3.abrupt("return", false);

            case 1:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, _this3);
    }))();
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  restart() {
    var _this4 = this;

    return _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              return _context4.abrupt("return", false);

            case 1:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, _this4);
    }))();
  }
}

module.exports = AutoUpdater;
