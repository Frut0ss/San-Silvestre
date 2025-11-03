let timerId = null;
let startTime = 0;
let elapsedTime = 0;

self.onmessage = function(e) {
  switch (e.data.command) {
    case 'start':
      startTime = Date.now() - (e.data.elapsedTime || 0);
      timerId = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        self.postMessage({ type: 'tick', time: elapsedTime });
      }, 1000);
      break;
    
    case 'pause':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      break;
    
    case 'stop':
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      startTime = 0;
      elapsedTime = 0;
      break;
  }
};
