const { join } = require("path"),
  { launch } = require("../utils"),
  { swapFactory, IS_OSX } = require("../env");

/**
 * Restart and launch detached swap
 * @returns {Promise}
 */
async function restartToSwap(extraArgs = []) {
  const { updateDir, logPath, execDir } = this.options,
    swap = swapFactory(this.options),
    args = swap.getArgs().concat(extraArgs);
  swap.extractScript(execDir);
  if (IS_OSX) {
    await launch(swap.getRunner(), args, updateDir, logPath);
  } else {
    await launch('cmd.exe', ['/c', swap.getRunner()].concat(args), updateDir, logPath);
  }
  nw.App.quit();
}


exports.restartToSwap = restartToSwap;
