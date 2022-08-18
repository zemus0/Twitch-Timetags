chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.set({"key": tab.id});

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files:["inject.js"]
    });

    chrome.windows.create({
        url: "timestamp.html",
        type: "popup",
        height:500,
        width:400,
    });

});

