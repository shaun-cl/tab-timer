(function (global) {
  function getPackageDirectory() {
    return new Promise(function(resolve, reject) {
      chrome.runtime.getPackageDirectoryEntry(dir => resolve(dir));
    });
  }

  function getDirectoryEntry(dir, name) {
    return new Promise(function(resolve, reject) {
      dir.getDirectory(name, {}, d => resolve(d));
    });
  }

  function getEntries(dir) {
    return new Promise(function(resolve, reject) {
      var dirReader = dir.createReader();
      var entries = [];

      function getAppendEntries() {
        dirReader.readEntries(function(results) {
          if (results.length) {
            entries = entries.concat(results.filter(f => !f.name.startsWith(".")));
            getAppendEntries();
          } else
            resolve(entries);
        });
      }

      getAppendEntries();
    });
  }

  function getAudioFiles() {
    return new Promise((resolve, reject) => {
      getPackageDirectory().then(dir => getDirectoryEntry(dir, 'audio'))
                           .then(getEntries)
                           .then(entries => entries.map(f => 'audio/' + f.name))
                           .then(e => resolve(e));
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, callback) => {
    console.log("Received message", message);
    if (message.command == 'getAudioFiles') {
      getAudioFiles().then(files => callback(files))
      return true;
    }
  });
})(window);
