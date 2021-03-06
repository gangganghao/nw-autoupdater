"use strict";

var _require = require("path"),
    join = _require.join,
    fs = require("fs"),
    SwapAbstract = require("./Abstract");

class SwapLinux extends SwapAbstract {

  constructor(options) {
    super(options);
  }

  extractScript(homeDir) {
    var content = this.getScriptContent() + `
echo " "
echo "$APP_PATH/\${RUNNER}&"
"$APP_PATH/\${RUNNER}"&`,
        scriptPath = join(homeDir, "swap.sh");
    fs.writeFileSync(scriptPath, content, "utf8");
    fs.chmod(scriptPath, 511); // 755
    this.scriptPath = scriptPath;
  }

}

module.exports = SwapLinux;