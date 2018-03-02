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

            var _options, updateDir, logPath, swap, args;

            return _regenerator2.default.wrap(function _callee$(_context) {
                  while (1) {
                        switch (_context.prev = _context.next) {
                              case 0:
                                    _options = this.options, updateDir = _options.updateDir, logPath = _options.logPath, swap = swapFactory(this.options), args = swap.getArgs().concat(extraArgs);


                                    swap.extractScript(updateDir);
                                    _context.next = 4;
                                    return launch(swap.getRunner(), args, updateDir, logPath);

                              case 4:
                                    nw.App.quit();

                              case 5:
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require("path"),
    join = _require.join,
    _require2 = require("../utils"),
    launch = _require2.launch,
    _require3 = require("../env"),
    swapFactory = _require3.swapFactory;

exports.restartToSwap = restartToSwap;