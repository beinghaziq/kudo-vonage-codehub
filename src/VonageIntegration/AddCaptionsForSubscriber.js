import Avatar from 'react-avatar';
import React from 'react';
import { createRoot } from 'react-dom';

export function addCaptionsForSubscriber(CaptionText, hostName = 'host') {
  // Create caption container
  const captionContainer = document.createElement('div');
  captionContainer.id = 'captionContainer';
  captionContainer.className = 'flex w-[13.8125rem] items-start rounded-md bg-white shadow-md border-r-2 flex-col p-3';

  // Create profile section
  const profileSection = document.createElement('div');
  profileSection.id = 'profile';
  profileSection.className = 'flex justify-center items-center gap-3';

  // Create avatar
  const avatarElement = document.createElement('div');
  createRoot(avatarElement).render(<Avatar name={hostName} size="20" round={true} />);

  // Create host name
  const hostNameElement = document.createElement('h1');
  hostNameElement.textContent = hostName;
  hostNameElement.className = 'text-gray-900 font-medium text-sm leading-5 font-noto-sans';

  // Append avatar and host name to profile section
  profileSection.appendChild(avatarElement);
  profileSection.appendChild(hostNameElement);

  // Create caption text
  const captionTextElement = document.createElement('div');
  captionTextElement.textContent = CaptionText;
  captionTextElement.className = 'text-gray-500 font-normal text-sm leading-5 font-noto-sans pt-2';

  // Append profile section and caption text to caption container
  captionContainer.appendChild(profileSection);
  captionContainer.appendChild(captionTextElement);

  // Append caption container to subscriber container
  const subscriberContainer = document.getElementById('subscriberContainer');
  subscriberContainer.appendChild(captionContainer);

  // Remove the captions after 5 seconds
  const removalTimerDuration = 6 * 1000;
  setTimeout(() => {
    captionContainer.remove();
  }, removalTimerDuration);
}
