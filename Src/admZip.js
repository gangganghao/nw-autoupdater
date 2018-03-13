const AdmZip = require('adm-zip');
var fs = require('fs');
/**
 * Extract archive into a given directory
 * @param {string} archiveFile
 * @param {string} extractDest
 * @param {function} onProgress
 */
async function decompressZip(archiveFile, extractDest, onProgress) {
    return new Promise((resolve, reject) => {
        try {
            var zip = new AdmZip(archiveFile);
            var entries = zip.getEntries();
            if (entries && entries.length > 0) {
                var entryCount = entries.length;
                var currentCount = 0;
                onProgress(0, entryCount);
                for (let index = 0; index < entries.length; index++) {
                    const entry = entries[index];
                    onProgress(index + 1, entryCount);
                    zip.extractEntryTo(entry, extractDest, true, true);
                }
                // entries.forEach(function (entry,index) {
                //     // currentCount++;
                //     zip.extractEntryTo(entry, extractDest, true, true);
                //     onProgress(index + 1, entryCount);
                // });
                resolve();
            } else {
                onProgress(100, 100);
                resolve();
            }
        } catch (error) {
            onProgress(1, 1);
            reject(error);
        }
    });
}

module.exports = decompressZip;