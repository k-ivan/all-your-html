class Slider {
  static get CSS_CLASS() {
    return {
      CURRENT: 'current',
      NEXT: 'next',
      HIDE: 'hide'
    }
  }

  constructor(root) {
    const slides = [...root.querySelectorAll('img')];

    this.refs = {
      root: root,
      slides,
      prevButton: root.querySelector('.btn.prev'),
      nextButton: root.querySelector('.btn.next')
    }

    this.state = {
      isAnimating: false,
      current: 0,
      length: slides.length
    }

    const buttons = [this.refs.nextButton, this.refs.prevButton];
    buttons.forEach(btn => btn.addEventListener('click', this));
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

  onAnimationEnd() {
    slides[fromIndex].classList.remove(Slider.CSS_CLASS.HIDE);
    slides[fromIndex].classList.remove(Slider.CSS_CLASS.CURRENT);
    slides[toIndex].classList.remove(Slider.CSS_CLASS.NEXT);
    slides[toIndex].classList.add(Slider.CSS_CLASS.CURRENT);
    state.current = toIndex;
    state.isAnimating = false;
  }

  goTo(fromIndex, toIndex) {
    const state = this.state;
    if (state.isAnimating) return;

    const { HIDE, CURRENT, NEXT } = Slider.CSS_CLASS;
    const { slides, root } = this.refs;
    state.isAnimating = true;

    root.addEventListener('animationend', function onAnimationEnd() {
      slides[fromIndex].classList.remove(HIDE);
      slides[fromIndex].classList.remove(CURRENT);
      slides[toIndex].classList.remove(NEXT);
      slides[toIndex].classList.add(CURRENT);
      state.current = toIndex;
      state.isAnimating = false;
      root.removeEventListener('animationend', onAnimationEnd);
    });

    slides[fromIndex].classList.add(HIDE);
    slides[fromIndex].offsetHeight; // for Firefox flashing
    slides[toIndex].classList.add(NEXT);
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