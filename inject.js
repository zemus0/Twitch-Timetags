chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'time') {
        let current_time = document.getElementsByClassName("live-time")[0].textContent;
        sendResponse(current_time);
    }
});