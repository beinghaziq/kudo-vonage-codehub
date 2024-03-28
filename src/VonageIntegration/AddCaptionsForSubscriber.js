import OT from '@opentok/client';
let captionsRemovalTimer;

export function addCaptionsForSubscriber(CaptionText) {
  if (OT.subscribers.find()) {
    const subscriberContainer = OT.subscribers.find().element;
    const [subscriberWidget] = subscriberContainer.getElementsByClassName('OT_widget-container');
    const captionBox = document.createElement('div');
    captionBox.classList.add('caption-box');
    captionBox.textContent = CaptionText;
    subscriberWidget.appendChild(captionBox);

    // remove the captions after 5 seconds
    const removalTimerDuration = 5 * 1000;
    clearTimeout(captionsRemovalTimer);
    captionsRemovalTimer = setTimeout(() => {
      captionBox.textContent = '';
    }, removalTimerDuration);
  }
}
