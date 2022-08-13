var run_once = false;
chrome.action.onClicked.addListener((tab) => {
    if(!run_once) {
        run_once = true;
        chrome.windows.create({
            url: "chat.html",
            type: "popup",
            height:500,
            width:300,
        });
    }
});