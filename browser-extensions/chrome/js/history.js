
console.log("Setting up message listener")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request)
    console.log(sender)
    console.log(sendResponse)
  }
}
