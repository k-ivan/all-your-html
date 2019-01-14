const cursor = document.createElement('div');
cursor.classList.add('cursor');

document.body.appendChild(cursor);

document.addEventListener('pointermove', (event) => {
  const { clientX, clientY } = event;
  cursor.style.setProperty('--x', clientX);
  cursor.style.setProperty('--y', clientY);
});