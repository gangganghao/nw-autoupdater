"use strict";

var _require = require("path"),
    join = _require.join,
    fs = require("fs");

class SwapAbstract {

  constructor(options) {
    this.options = options;
  }

  getScriptContent() {
    var swapScript = this.options.swapScript;

    return `#!/bin/bash
for i in "$@"
do
case $i in
  --app-path=*)
    APP_PATH="\${i#*=}"
    shift
    ;;
  --bak-path=*)
    BAK_PATH="\${i#*=}"
    shift
    ;;
  --update-path=*)
    UPDATE_PATH="\${i#*=}"
    shift
    ;;
  --runner=*)
    RUNNER="\${i#*=}"
    shift
    ;;
  --verbose=*)
    VERBOSE="\${i#*=}"
    shift
    ;;
    *)
            # unknown option
    ;;
esac
done
` + (swapScript || `
echo "rsync -al\${VERBOSE} --delete \${UPDATE_PATH}/. \${APP_PATH}/"
rsync -al\${VERBOSE} "\${UPDATE_PATH}/." "\${APP_PATH}/"
`);
  }

  extractScript(homeDir) {
    var content = this.getScriptContent(),
        scriptPath = join(homeDir, "swap.sh");
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
        logDir = _options.logDir,
        verbose = _options.verbose;

    return [`--app-path=${join(execDir, executable)}`, `--update-path=${updateDir}`, `--runner=''`, `--bak-path=${backupDir}`, `--verbose=${verbose ? `v` : ``}`];
  }

  getRunner() {
    return this.scriptPath;
  }

}

module.exports = SwapAbstract;