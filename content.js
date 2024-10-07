// Print "Hello World" to the console
//
  // Get information about the current page
//
// wait time for timeouts (default 20 minutes)
let wait_time = 20 * 60 * 1000
function checkRegex(username) {
  let regex = /\w{4,}_?\d{6,}/;
  let res = regex.exec(username);
  if(res){
    return true 
  }
  return false

}
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "blockUser") {
    blockUser()
      .then(() => sendResponse({status: "blocked"}))
      .catch((error) => sendResponse({status: "failed", error: error.message}));
    return true;  // Indicates that the response is sent asynchronously
  }else if (request.action === "checkPage") {
    let isFollowersPage = window.location.href.includes("/followers") || window.location.href.includes("/verified_followers");
    sendResponse({isFollowersPage: isFollowersPage});
  } else if (request.action === "purgeHeretics") {
    let terms = await chrome.runtime.sendMessage({action: 'getTerms'});
    let ratio = await chrome.runtime.sendMessage({action: 'getTargetRatio'});
    let username = getUsername(); 
    console.log("Username: ",username);
    let whitelist = await chrome.runtime.sendMessage({action: 'getWhitelist'});
    whitelist = whitelist.whitelist;  
    terms = terms.terms;
    let target_follower_ratio = ratio.ratio;
    console.log('Terms: ',terms);
    console.log("Purging heretics...");
    // Your purging logic here
    console.log("BLOOD FOR THE BLOOD GOD");

    let links = {}; 
    let enriched_info = {}
    await scrollUntilEnd();
    
    let usernames = Object.keys(links).filter((username) => !whitelist.includes(username));
    let keep_checking = true;
    let checks = 0;
    while(keep_checking) {
      let res = await makeApiCall(usernames);
      if(res.success) {
        let data = res.data;
        let processing = data.filter((item) => item.status && item.status.includes("processing"))
        let completed = data.filter((item) => item.status && item.status.includes("completed"))
      
        completed.forEach((item) => {
          enriched_info[item.username] = item;
          usernames = usernames.filter((user) => user !== item.username );
        })
        if(checks >= 25 || usernames.length === 0 || processing.length === 0) {
          keep_checking = false;
        }
        checks+=1;

      }


    }
     
    let banned = {}
    console.log("Enriched info: ",enriched_info);
    console.log("Usernames left to process: ",usernames);

    for(const [username, ei] of Object.entries(enriched_info)) {

      console.log("Checking ", username);
      let follower_ratio = 0;
      if(ei.followers === 0) {
        follower_ratio = ei.following;
      }else{

        follower_ratio = ei.following / ei.followers;
      }
      if(ei.following === 0) {
        follower_ratio = 0;
      }
      console.log(`${username} has a follower ratio of ${follower_ratio} comparedt to a target of ${target_follower_ratio}`)
      if(checkRegex(username)  || ei.tweets <= 5 || (follower_ratio !== -1 && follower_ratio <= target_follower_ratio) || ei.followers === 0){
        console.log("Bannable: ",username);
        banned[username] = ei;
      }else{
        terms.forEach((term) => {
          if(username.includes(term) || ei.description.includes(term) || ei.screen_name.includes(term)){
            console.log("Bannable: ",username);
            banned[username] = ei;
          }
        })
      }
    }
    let banned_users = Object.keys(banned);
    console.log(`Blockable users (${banned_users.length}): `,banned_users);
    for(var i = 0; i < banned_users.length; i++) {
      chrome.runtime.sendMessage({action: "startBlocking", username: banned_users[i]});

      await new Promise(resolve => setTimeout(resolve, 15000)); 
    }
    function getUsername() {
      let a_href_spl = document.querySelector('[aria-label="Profile"]').href.split("/");
      let a_href = a_href_spl[a_href_spl.length-1];
      console.log("Username: ",a_href);
      return a_href;
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
  await moreElipses.click();
  const blockButton = await waitForElement('[data-testid="block"]');
  await blockButton.click();

  // Wait for the confirmation modal and click the confirm button
  const confirmButton = await waitForElement('[data-testid="confirmationSheetConfirm"]');
  await confirmButton.click();

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
async function makeApiCall(usernames) {
  console.log("MakeAPICall: ",usernames);
  try {
    const response = await sendMessageToBackground({
      action: "makeApiCall",
      url: "https://crackedeng.com/botbot/api/get_users",
      options: {
        method: 'POST', // or 'POST', etc.
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers you need
        },
        // Add body if it's a POST request
        // body: JSON.stringify(data)
        body: {usernames: usernames}
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

