let winID = -1
chrome.action.onClicked.addListener(tab => {
  chrome.storage.local.set({ key: tab.id })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['inject.js']
  })

  chrome.windows.update(winID, { focused: true }, () => {
    if (chrome.runtime.lastError) {
      chrome.windows.create(
        {
          url: 'timestamp.html',
          type: 'popup',
          height: 500,
          width: 400
        },
        extWin => {
          winID = extWin.id
        }
      )
    }
  })
})
