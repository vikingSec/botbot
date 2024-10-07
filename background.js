chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "makeApiCall") {
    fetch(request.url, {
      method:"POST",
      body: JSON.stringify(request.options.body),
      headers:{
        'Content-Type':'application/json'
      } 
    })
      .then(response => {
        console.log("Response from bg: ", response);
        return response.json()
      })
      .then(data => {
        console.log("Got data: ",data);
        sendResponse({ success: true, data: data });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keeps the message channel open for the asynchronous response
  }else if(request.action === "startBlocking") {
    let username = request.username;
    url = "https://x.com/"+username
    chrome.tabs.create({url: url, active: false}, (tab) => {
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, {action: "blockUser"}, (response) => {
          if (response && response.status === "blocked") {
            console.log(`Blocked user: ${username}`);

          } else {
            console.log(`Failed to block user: ${username}`);
          }
          
        });
      }, 1000)
        
    });
  }
});


