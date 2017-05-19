// Get a reference to the input configuration box
const serverInput = document.getElementById('server-address');

serverInput.onchange = function(a) {
    chrome.storage.local.set({localserver: serverInput.value})
};

chrome.storage.local.get('localserver', function (storage) {
    if (storage.localserver) {
        serverInput.value = storage.localserver;
    }
});
