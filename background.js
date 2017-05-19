
// Function that checks if the url has a valid SSL certificate
// Returns a Promise<{status: string, hasSSL: boolean}>
function checkCorrectSSL (url) {
    return new Promise((resolve, reject) => {
        const checkSSLCallback = function (details) {
            if (details.error == 'net::ERR_INSECURE_RESPONSE') {
                // console.log('Insecure request detected3');
                // If it fails because an SSL error, then
                // the page doesn't have correct SSL certificate
                return resolve({status: 'OK', hasSSL: false});
            }
        };

        // If a request made to the url fails check to see if it was due to an
        // SSL error
        chrome.webRequest.onErrorOccurred.addListener(checkSSLCallback, {urls: [url]});

        const removeListeners = (data) => {
            chrome.webRequest.onErrorOccurred.removeListener(checkSSLCallback);
        };

        const removeListenerAndResolve = () => {
            removeListeners();
            // If the request works or fails for another reason we assume we have
            // SSL
            return resolve({status: 'OK', hasSSL: true});
        }

        // If ten seconds passes without response we assume the server doesn't exist
        setTimeout(() => {
            removeListeners();
            return resolve({status: 'TIMEOUT', hasSSL: false});
        }, 5000

        )

        // Make the request to see if it fails or not and remove the listeners after
        fetch(url)
            .then(removeListenerAndResolve)
            .catch(removeListenerAndResolve);
    })
}


// If the local storage is changed, check if the new server has SSL
chrome.storage.onChanged.addListener(changes => {
    if (changes.localserver) {
        checkCorrectSSL(`https://${changes.localserver.newValue}/`)
            .then(response => {
                if (response.status === 'OK' && response.hasSSL === false) {
                    showInsecureDialog(changes.localserver.newValue);
                }
                if (response.status === 'TIMEOUT') {
                    showTimeoutDialog();
                }
            });
    }
});

function showInsecureDialog(domain) {
    chrome.windows.create({
        url: `insecure.html?domain=${domain}`,
        type: 'popup', width: 400, height: 400,
    });
}

function showTimeoutDialog() {
    chrome.windows.create({
        url: 'timeout.html',
        type: 'popup', width: 400, height: 400,
    });
}
