'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// جسر آمن: الواجهة بتنادي العمليات عبر window.wisal.invoke بس، من غير Node مباشر.
contextBridge.exposeInMainWorld('wisal', {
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
});
