let element = null;

const elementName = 'fps-meter';

function isDefined() {
  return customElements.get(elementName);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'clicked_browser_action') {
      if (!element) {
        if (!isDefined()) {
          customElements.define(elementName, FPSMeter);
        }
        element = document.createElement(elementName);
        document.body.appendChild(element);
      } else {
        document.body.removeChild(element);
        element = null;
      }
    }
  }
);