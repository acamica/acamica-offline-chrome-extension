function sendServerFromLocalStorage () {
  chrome.storage.local.get('localserver', function (storage) {
      sendServerLocation(storage.localserver);
  });
}

// As soon as the script loads, send the localserver from the local storage
// This is here to avoid missing 'GET_VIDEO_LOCATOR'
sendServerFromLocalStorage();


// If the page ask for the video localserver, send it
window.addEventListener('message', function (event) {
    // We only accept messages from ourselves
    if (event.source !== window) {
        return;
    }

    if (event.data.type && (event.data.type == "GET_VIDEO_LOCAL_SERVER")) {
        sendServerFromLocalStorage();
    }
});

// If the local storage is changed by the dialog, send it to the page
chrome.storage.onChanged.addListener(changes => {
    if (changes.localserver) {
        sendServerLocation(changes.localserver.newValue);
    }
})


function sendServerLocation(localserver) {
    window.postMessage({type: 'SET_VIDEO_LOCAL_SERVER', localserver}, '*');
}
