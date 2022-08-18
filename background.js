var run_once = false;
chrome.action.onClicked.addListener((tab) => {
    if(!run_once) {
        run_once = true;
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
    }
});

