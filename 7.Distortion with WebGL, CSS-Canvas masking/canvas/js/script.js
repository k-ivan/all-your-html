function loadImage(url) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  })
};

class Slider {
  static get STEPS() {
    // число кадров в маске
    return 23
  }

  static get TIME_STEP() {
    const time = 1400;
    return time / Slider.STEPS;
  }

  constructor({root, images, maskImage }) {
    this.refs = {
      root: root,
      ctx: root.getContext('2d'),
      mask: maskImage,
      prevButton: document.querySelector('.btn.prev'),
      nextButton: document.querySelector('.btn.next')
    }

    this.state = {
      isAnimating: false,
      current: 0,
      length: images.length,
      stepCount: 0,
      lastTime: 0
    }

    Promise.all([maskImage, ...images].map(loadImage))
      .then(([loadedMask, ...loadedImages]) => {
        this.refs.images = loadedImages;
        this.refs.mask = loadedMask;
        const {
          refs: { images, ctx, root, nextButton, prevButton },
          state: { current }
        } = this;
        const buttons = [nextButton, prevButton];
        buttons.forEach(btn => btn.addEventListener('click', this));
        ctx.drawImage(images[current], 0, 0, root.width, root.height);
      });
  }

  handleEvent(event) {
    const { type, target } = event;
    const action = target.getAttribute('data-action');

    switch (true) {
      case(type === 'click' && action === 'prev'):
        this.onPrev();
        break;

      case(type === 'click' && action === 'next'):
        this.onNext();
        break;

      default:
        break;
    }
  }

  goTo(fromIndex, toIndex) {
    const self = this;
    const state = this.state;
    if (state.isAnimating) return;

    state.stepCount = 0;
    state.lastTime = 0;
    state.isAnimating = true;

    function loop(time) {
      if (!state.isAnimating) return;
      const dt = time - state.lastTime;
      if (dt >= Slider.TIME_STEP) {
        self.render(fromIndex, toIndex);
        state.lastTime = time;
        state.stepCount++;
        if (state.stepCount >= Slider.STEPS) {
          state.isAnimating = false;
          state.current = toIndex;
        }
      };
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  render(fromIndex, toIndex) {
    const state = this.state;
    const refs = this.refs;
    const { root, ctx, images, mask } = refs;
    const { width: w, height: h } = root;

    const currentImage = images[fromIndex];
    const nextImage = images[toIndex];

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(mask, -w * state.stepCount, 0, w * Slider.STEPS, h);
    ctx.globalCompositeOperation = 'source-in';
    ctx.drawImage(currentImage, 0, 0, w, h);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(nextImage, 0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  onNext() {
    const { current, length } = this.state;
    const nextIndex = (current + 1 + length) % length;
    this.goTo(current, nextIndex);
  }

  onPrev() {
    const { current, length } = this.state;
    const nextIndex = (current - 1 + length) % length;
    this.goTo(current, nextIndex);
  }
}