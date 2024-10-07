// Print "Hello World" to the console
//
  // Get information about the current page
//
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "blockUser") {
    blockUser()
      .then(() => sendResponse({status: "blocked"}))
      .catch((error) => sendResponse({status: "failed", error: error.message}));
    return true;  // Indicates that the response is sent asynchronously
  }else if (request.action === "checkPage") {
    let isFollowersPage = window.location.href.includes("/followers") || window.location.href.includes("/verified_followers");
    console.log("Is followers page:", isFollowersPage);
    sendResponse({isFollowersPage: isFollowersPage});
  } else if (request.action === "purgeHeretics") {
    console.log("Purging heretics...");
    // Your purging logic here
    console.log("BLOOD FOR THE BLOOD GOD");

    let links = {}; 
    let sketchy_users = {};
    let enriched_info = {}
    await scrollUntilEnd();
    for(const [username, data] of Object.entries(links)) {
      let regex = /\w+_?\d{6,}/;
      let res = regex.exec(username);
      if(res){
        sketchy_users[username] = {link: data.link, desc: data.desc};
      }
    }
    let keys = Object.keys(links)
    const requests = keys.map((k) => {
      console.log("K: ",k);
      makeApiCall(k).then(res => {
        if(res.success){
          let js = res.data;
          console.log("JS: ",res.data);
          return {key: k,
            tweets : js.tweets,
            followers: js.followers,
            following: js.following,
            joined: js.joined,
            avatar_url: js.avatar_url
          }
        }else{
          return {key: k, error: "ERROR"}
        }

      })
    });
    let batch_size = 10;
    let batch_wait = 2000;
    for(var i = 0; i < requests.length; i+=batch_size) {
      const batch = results.slice(i, i+batch_size);
      const results = Promise.all(batch);
      results.forEach((res) => {
        if(res.data) {
          enriched_info[res.data.key] = res.data;
        }
      })
      await new Promise(resolve => setTimeout(resolve, batch_wait));
    }
     
    let banned = {}
    for(var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let username = key;

      console.log("Checking ", username);
      let ei = enriched_info[username];
      let follower_ratio = 0;
      if(ei.followers === 0) {
        follower_ratio = ei.following;
      }else{

        follower_ratio = ei.following / ei.followers;
      }
      if(Object.keys(sketchy_users).includes(username) || ei.tweets <= 5 ){
        console.log("Bannable: ",username);
        banned[username] = ei;
      }
    }
    console.log(`Bannable users (${Object.keys(banned).length}) : `,banned);
    let banned_keys = Object.keys(banned);
    for(var i = 0; i < banned_keys.length; i++) {
      chrome.runtime.sendMessage({action: "startBlocking", username: banned_keys[i]}, function(response) {
        //document.getElementById('status').textContent = 'Blocking process started. You can close this popup.';
      });

      await new Promise(resolve => setTimeout(resolve, 15000)); 
    }
    
    async function smoothScrollToBottom() {
      return new Promise((resolve) => {
        let lastScrollTop = document.documentElement.scrollTop;
        let scrollInterval = setInterval(async () => {
          window.scrollBy(0, 500); 
          await new Promise(resolve => setTimeout(resolve, 1000));
          let followers_pane = document.querySelector('[data-testid="primaryColumn"]');
          let new_nodes = followers_pane.querySelectorAll('[data-testid="UserCell"]');
          new_nodes.forEach((node) => {
            let links_in_node = node.querySelectorAll('a')
            links_in_node.forEach((link) => {
              let regex = /https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]+)\/?$/;
              let desc_check = node.querySelectorAll('[dir="auto"]')[1];
              let desc = "";
              if(desc_check) {
                desc = desc_check.textContent;
              }
              let res = regex.exec(link);
              if(res) {
                links[res[2]] = {link:link.href, desc: desc};  
              }        
            });
          });

          if (document.documentElement.scrollTop === lastScrollTop) {
            clearInterval(scrollInterval);
            console.log("Reached the bottom or can't scroll further.");
            resolve();
          } else {
            lastScrollTop = document.documentElement.scrollTop;
          }
          console.log("Number of usernames: ",Object.keys(links).length);

        }, 100); 
      });

    }
    async function scrollUntilEnd() {
      let prevHeight = document.documentElement.scrollHeight;
      while (true  ) {
        await smoothScrollToBottom();
        await new Promise(resolve => setTimeout(resolve, 6000)); 

        let newHeight = document.documentElement.scrollHeight;
        if (newHeight === prevHeight ) {
          console.log("Scrolling complete. No more content to load.");
          break;
        }
        prevHeight = newHeight;
      }
    }
  }else if(request.action === "testblock"){
    
  }
  return true;
});


async function blockUser() {
  // Find and click the block button
  const moreElipses = await waitForElement('[aria-label="More"]');
  moreElipses.click();
  const blockButton = await waitForElement('[data-testid="block"]');
  blockButton.click();

  // Wait for the confirmation modal and click the confirm button
  const confirmButton = await waitForElement('[data-testid="confirmationSheetConfirm"]');
  confirmButton.click();

  // Wait a bit to ensure the blocking action is completed

  await new Promise(resolve => setTimeout(resolve, 2000)); 
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    function checkElement() {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      } else {
        setTimeout(checkElement, 100);
      }
    }

    checkElement();
  });
}
  console.log("Content script loaded");
function sendMessageToBackground(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, response => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}
async function makeApiCall(username) {
  console.log("MakeAPICall: ",username);
  try {
    console.log("Calling with username ", username);
    const response = await sendMessageToBackground({
      action: "makeApiCall",
      url: "https://crackedeng.com/botbot/api/get_user",
      options: {
        method: 'POST', // or 'POST', etc.
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers you need
        },
        // Add body if it's a POST request
        // body: JSON.stringify(data)
        body: {username: username}
      }
    });

    if (response.success) {
      console.log("API response:", response.data);
      return {success: true, data: response.data}
      // Handle the API response data here
    } else {
      console.error("API call failed:", response.error);

      return {success: false, data: {}}
      // Handle the error here
    }
  } catch (error) {
    console.error("Error sending message to background script:", error);

    return {success: false, data: {}}
  }
}

