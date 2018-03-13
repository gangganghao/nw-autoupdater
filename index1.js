const EventEmitter = require( "events" ),
      AppSwapStrategy = require( "./Lib/Strategy/AppSwap" ),
      ScriptSwapStrategy = require( "./Lib/Strategy/ScriptSwap" ),
      semver = require( "semver" ),
      os = require( "os" ),
      {lstatSync, existsSync} = require('fs'),
      { join, basename, dirname, parse } = require( "path" ),
      unpackTarGz = require( "./Lib/unpackTarGz" ),
      // unpackZip = require( "./Lib/unpackZip" ),
      // unpackZip = require( "./Lib/unZip" ),
      unpackZip = require( "./Lib/yauzl" ),
      debounce = require( "debounce" ),

      { readJson, download }  = require( "./Lib/request" ),
      { launch, rtrim, remove } = require( "./Lib/utils" ),
      { PLATFORM_FULL, swapFactory,
        getExecutable, UPDATE_DIR, EXEC_DIR, BACKUP_DIR, LOG_PATH } = require( "./Lib/env" ),

      ERR_INVALID_REMOTE_MANIFEST = "无效的清单数据",
      DEBOUNCE_TIME = 50,

      DEFAULT_OPTIONS = {
        executable: null,//可执行程序名字
        backupDir: BACKUP_DIR,//备份地址
        execDir: EXEC_DIR,//程序所在文件夹
        updateDir: UPDATE_DIR,//更新地址
        logPath: LOG_PATH,
        verbose: false,
        swapScript: null,
        strategy: "AppSwap",//AppSwap：app更新，ScriptSwap：重新安装
        accumulativeBackup: false//是否保留所有历史版本
      };

      const fs = require("fs-extra");
class AutoUpdater extends EventEmitter {
  /**
   * Create AutoUpdate
   * @param {Object} manifest
   * @param {Object} options
   */
  constructor( manifest, options = {}){

    super();

    this.manifest = manifest;
    this.release = "";
    this.argv = nw.App.argv;
    this.remoteManifest = "";
    this.options = Object.assign( {}, DEFAULT_OPTIONS, options );
    this.options.backupDir += this.options.accumulativeBackup ? `_${Math.floor(Date.now() / 1000)}` : ``;
    this.options.execDir = rtrim( this.options.execDir );
    this.options.executable = this.options.executable || getExecutable( manifest.name );
    // Mixing up a chosen strategy
    Object.assign( this, this.options.strategy === "ScriptSwap" ? ScriptSwapStrategy : AppSwapStrategy );

  }
  /**
   * Download new version
   * @param {Object} packageUrl
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async download( packageUrl, { debounceTime } = { debounceTime: DEBOUNCE_TIME }){
    if ( !packageUrl){
      throw new Error( `packageUrl can't be null, ${PLATFORM_FULL}` );
    }
    const onProgress = ( length,totalSize ) => {
      this.emit( "download", length, totalSize );
    };
    try {
      remove( this.options.updateDir );
      return await download( packageUrl, os.tmpdir(), debounce( onProgress, debounceTime ));
    } catch ( e ) {
      throw new Error( `Cannot download package from ${packageUrl}` );
    }
  }
  /**
   * Unpack downloaded version
   * @param {string} updateFile
   * @param {Object} options
   * @returns {Promise<string>}
   */
  async unpack( updateFile, { debounceTime } = { debounceTime: DEBOUNCE_TIME } ){
    const isZipRe = /\.zip$/i,
          isGzRe = /\.tar\.gz$/i,
          onProgress = ( installFiles, totalFiles ) => {
            this.emit( "install", installFiles, totalFiles );
          },
          updateDir = this.options.updateDir;

    if ( !updateFile ){
      throw new Error( "You have to call first download method" );
    }

    switch( true ) {
      case isGzRe.test( updateFile ):
         try {
          await unpackTarGz( updateFile, updateDir, debounce( onProgress, debounceTime ) );
         } catch ( e ) {
            throw new Error( `Cannot unpack .tar.gz package ${updateFile}` );
         }
         break;
      case isZipRe.test( updateFile ):
         try {
          await unpackZip( updateFile, updateDir, debounce( onProgress, debounceTime ) );
         } catch ( e ) {
            throw new Error( `Cannot unpack .zip package ${updateFile}: ${e.message}` );
         }
         break;
      default:
         throw new Error( "Release archive of unsupported type" );
         break;
    }

      //If extract zip in new folder
      let newPath = join(updateDir, parse(updateFile).name);
      if (existsSync(newPath)) {
          if (lstatSync(newPath).isDirectory()) {
              this.options.updateDir = newPath;
          }
      }

    return updateDir;
  }

  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  isSwapRequest(){
    return false;
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  async swap(){
    return false;
  }
  /**
   * @deprecated since v.1.1.0
   * @returns {Boolean}
   */
  async restart(){
    return false;
  }
}

module.exports = AutoUpdater;
