const perf = (performance || Date);

const WIDTH = 100;
const HEIGHT = 70;
const FONT_SIZE = 26;

const tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    :host {
      position: fixed;
      z-index: 9999;
      left: 16px;
      top: 16px;
      transform: translate(calc(var(--x) * 1px), calc(var(--y) * 1px));
      overflow: hidden;
      border-radius: 3px;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    canvas {
      display: block;
      background: linear-gradient(hsla(204, 64%, 54%, 1), hsl(188, 69%, 64%));
    }
  </style>
  <canvas></canvas>
`;

class FPSMeter extends HTMLElement {
  static get observedAttributes() {
    return ['is-running'];
  }

  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(tmpl.content.cloneNode(true));

    this.canvas = shadowRoot.querySelector('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = `400 ${FONT_SIZE}px/1 'SFMono-Regular', 'Menlo', monospace`;

    this.pos = { x: 0, y: 0 };

    this.isRunning = false;
    this.frame = 0;
    this.startTime = 0;
    this.currentTime = 0;
    this.allFPS = [];

    [
      'onPointerDown',
      'onPointerMove',
      'onPointerUp',
      'toggle'
    ].forEach(method => this[method] = this[method].bind(this));
    this.addEventListener('pointerdown', this.onPointerDown);
    this.addEventListener('click', this.toggle);
  }

  get isRunning() {
    return this.hasAttribute('is-running');
  }

  set isRunning(val) {
    if (val) {
      this.setAttribute('is-running', '');
    } else {
      this.removeAttribute('is-running');
    }
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
  }

  onPointerDown(event) {
    const { clientX, clientY } = event;
    const { pos } = this;
    const box = this.getBoundingClientRect();
    pos.x = clientX - box.x;
    pos.y = clientY - box.y;
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerUp);
  }

  onPointerUp(event) {
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerUp);
  }

  onPointerMove(event) {
    const { clientX, clientY } = event;
    const { pos } = this;
    const moveX = clientX - pos.x;
    const moveY = clientY - pos.y;
    this.style.setProperty('--x', moveX);
    this.style.setProperty('--y', moveY);
  }

  connectedCallback() {}

  disconnectedCallback() {}

  attributeChangedCallback(attrName, oldVal, newVal) {}
}