const perf = (performance || Date);

const WIDTH = 100;
const HEIGHT = 70;
const FONT_SIZE = 26;

class FPS {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = '__FPS_METER__';
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = `400 ${FONT_SIZE}px/1 'SFMono-Regular', 'Menlo', monospace`;
    this.isRunning = false;
    this.frame = 0;
    this.startTime = 0;
    this.currentTime = 0;
    this.allFPS = [];
    document.body.appendChild(this.canvas);
    this.canvas.onclick = () => this.toggle();
  }

  toggle() {
    this.isRunning = !this.isRunning;
    this.isRunning && this.loop();
  }

  run() {
    this.isRunning = true;
    this.loop();
  }

  add(x) {
    this.allFPS.unshift(x);
    // this.allFPS.push(x);
    this.allFPS = this.allFPS.slice(0, WIDTH);
  }

  loop() {
    if (!this.isRunning) return;
    const self = this;
    window.requestAnimationFrame(function() {
      self.render();
      self.loop();
    })
  }

  render() {
    var i = 0;
    var ctx = this.ctx;
    const currentFPS = this.getFPS();
    this.add(currentFPS);
    const FPS = this.allFPS;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.ctx.fillStyle = '#000';
    for(i = 0; i <= WIDTH; i++) {
      ctx.fillRect(i, 0, 1, 5 + 60 - FPS[i]);
    }
    ctx.fillText(currentFPS, 8, HEIGHT - 8 + 1);

    ctx.fillStyle = "#fff";
    for(i = 0; i<= WIDTH; i++) {
      ctx.fillRect(i, 5 + 60 - FPS[i], 1, 2);
    }
    ctx.fillText(currentFPS, 8, HEIGHT - 8);
  }

  getFPS() {
    this.frame++;
    const now =  perf.now();
    this.currentTime = (now - this.startTime) * 0.001;
    const result = Math.floor(this.frame / this.currentTime);
    if (this.currentTime > 1) {
      this.startTime = perf.now();
      this.frame = 0;
    }
    return result;
  }

  destroy() {
    this.isRunning = false;
    this.allFPS = null;
    document.body.removeChild(this.canvas);
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'clicked_browser_action') {
      const fps = new FPS();
      fps.run();
    }
  }
);