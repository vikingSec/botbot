console.log("Popup script loaded");

document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  let maindiv = document.getElementById("maindiv");
  let ghlinks = document.querySelectorAll(".donolink");
  ghlinks.forEach((ele) => {
    ele.addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({url: this.href});
    });
  })
  

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTerms") {
      let textfield = document.getElementById("terms");
      let termsText = textfield.value;
      let ret = termsText.split('\n').filter(t => t.trim() !== '');
      sendResponse({terms: ret});
      return true;
    }else if (request.action === "getTargetRatio") {
      let textfield = document.getElementById("ratio");
      let rawtext = textfield.value;
      let parsed = parseInt(rawtext.trim(), 10);
      if(isNaN(parsed)){
        sendResponse({ratio: -1});
        return true;
      } 
      sendResponse({ratio: parsed});
      return true;
    }
  });
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log("Got current tab");
    chrome.tabs.sendMessage(tabs[0].id, {action: "checkPage"}, function(response) {
      console.log("Received response:", response);
      if (chrome.runtime.lastError) {
        console.log("Error:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.isFollowersPage) {
        document.getElementById('startBlocking').addEventListener('click', function() {
          console.log("Purge button clicked");
          chrome.tabs.sendMessage(tabs[0].id, {action: "purgeHeretics"});
        });
     
      } 
      
    });
  });
});

