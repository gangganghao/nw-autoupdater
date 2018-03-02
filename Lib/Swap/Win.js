"use strict";

var _require = require("path"),
    join = _require.join,
    fs = require("fs"),
    SwapAbstract = require("./Abstract");

class SwapWin extends SwapAbstract {

  constructor(options) {
    super(options);
  }
  // @see http://steve-jansen.github.io/guides/windows-batch-scripting/part-2-variables.html
  getScriptContent() {
    return `@echo off
SET execDir=%~1
SET updateDir=%~2
SET backupDir=%~3
SET runner=%~4
SET verbose=%~5

rmdir "%backupDir%" /s /q
xcopy "%execDir%" "%backupDir%" /e /i /h /c /y
xcopy "%updateDir%" "%execDir%" /e /i /h /c /y

"%execDir%\\%runner%"
`;
  }

  extractScript(homeDir) {
    var content = this.getScriptContent(),
        scriptPath = join(homeDir, "swap.bat");
    fs.writeFileSync(scriptPath, content, "utf8");
    this.scriptPath = scriptPath;
  }

  /**
   * Get args for swap script
   * @returns {Array}
   */
  getArgs() {
    var _options = this.options,
        execDir = _options.execDir,
        updateDir = _options.updateDir,
        executable = _options.executable,
        backupDir = _options.backupDir,
        logDir = _options.logDir;

    return [execDir, updateDir, backupDir, executable, `false`];
  }

}

module.exports = SwapWin;