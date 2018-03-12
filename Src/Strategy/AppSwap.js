const { join  } = require( "path" ),
      fs = require( "fs-extra" ),
      { launch, copy } = require( "../utils" ),
      { swapFactory, IS_OSX } = require( "../env" );
      var cp = require('child_process');


  /**
   * Restart and launch detached swap
   * @returns {Promise}
   */
  async function restartToSwap(extraArgs = []){
    const { execDir, executable, updateDir, backupDir, logPath } = this.options,
          tpmUserData = join( nw.App.dataPath, "swap" ),
          app = join( updateDir, executable ),
          args = [ `--user-data-dir=${tpmUserData}`,
            `--swap=${execDir}`, `--bak-dir=${backupDir}` ].concat( extraArgs );

    if ( IS_OSX ) {
      await launch( "open", [ "-a", app, "--args", ...args ], updateDir, logPath );
    } else {
      await launch( app, args, updateDir, logPath );
    }
    nw.App.quit();
  }

  function getBakDirFromArgv( argv ){
    const raw = argv.find( arg => arg.startsWith( "--bak-dir=" ) );
    if ( !raw ) {
      return false;
    }
    return raw.substr( 10 );
  }

  /**
   * Is it a swap request
   * @returns {Boolean}
   */
  function isSwapRequest(){
    const raw = this.argv.find( arg => arg.startsWith( "--swap=" ) );
    if ( !raw ) {
      return false;
    }

    this.options.execDir = raw.substr( 7 );
    this.options.backupDir = getBakDirFromArgv( this.argv ) || this.options.backupDir;
    return true;
  }
  /**
   * Do swap
   */
  async function swap(){
    const { executable, backupDir, execDir, updateDir, logPath } = this.options,
          log = fs.openSync( logPath, "a" );
    if ( IS_OSX ) {
        // await copy( join( execDir, executable ), backupDir, log );
        await copy( updateDir, join( execDir, executable ), log );
    } else {
        // await copy( execDir, backupDir, log ,true);
        await copy( updateDir, execDir, log );
    }
  }
  /**
   * REstart after swap
   * @returns {Promise}
   */
  async function restart(extraArgs = []){
    const { execDir, executable, updateDir, logPath } = this.options,
          app = join( execDir, executable );

     if ( IS_OSX ) {
      var appPath = process.cwd().replace('/Contents/Resources/app.nw', '');
      var resourcePath = process.cwd().replace("app.nw", "restart.sh");
      fs.writeFile(resourcePath, ("sleep 1; open " + appPath), function () {
          fs.chmod(resourcePath, 0o770, function () {
              cp.spawn(resourcePath, ["&"], { detached: true });
              nw.App.closeAllWindows();
              nw.App.quit();
          });
      });
      return;
      // const log = fs.openSync( logPath, "a" );
      // fs.writeSync(log, `open ${[ "-a", app, "--args" ].concat( extraArgs ).join(',')},\n ${execDir}`, "utf-8");
      // await launch( "open", [ "-a", app, "--args" ].concat( extraArgs ), execDir, logPath );
    } else {
      await launch( app, [], execDir, logPath );
    }
    nw.App.quit();
  }


exports.restartToSwap = restartToSwap;
exports.restart = restart;
exports.swap = swap;
exports.isSwapRequest = isSwapRequest;
