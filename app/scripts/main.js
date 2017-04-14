/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BGYxBJ-YmUyI8u8DY9Z6aEDa7_FuVvyQlmqFwV5Y9bi6xXwzhG5RDBpG9ep4T-nZCwZzWxjgegM-95ZiA8xoqVE';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateBtn() {
  // Handling user rejecting permission for notification
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }
  
  // Handling user granting permission for notification
  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;
    
    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

// Initialize the 'Enable Push Messaging' button
// so that it becomes clickable
function initialiseUI() {
  // Subscribe or Unsubscribe the user from push notification
  // when the user clicks the button
  pushButton.addEventListener('click', function() {
    /* 
    When the button gets clicked, it becomes disabled or
    unavailable for click for a moment because
    users may click the button multiple times
    while the process to 'enabling' or 'subscribing' to notification takes a while  
    */    
    pushButton.disabled = true;
    if (isSubscribed) {
      // TODO: Unsubscribed user
      // If user already subscribes, unsubscribe it
    } else {
      // If the user do not already subscribe, subscribe it
      subscribeUser();
    }
  });
  
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
      console.log('User IS subscribed');
    } else {
      console.log('User is NOT subscribed');
    }

    updateBtn();
  });
}

// Registering Service Worker where the file name is 'sw.js'
if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log("Service Worker and Push is supported");

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log("Service Wroker is registered", swReg);
    swRegistration = swReg;
    // Initialize the button UI by subscribing to notificaitons
    initialiseUI();
  })
  .catch(function(error) {
    console.log("Service Worker Error", error);
  });
} else {
  console.log("Push messaging is not supported");
  pushButton.textContent = "Push Not Supported";
}
