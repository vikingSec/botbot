console.log("Popup script loaded");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    let maindiv = document.getElementById("maindiv");
    maindiv.innerHTML = "<p>Checking page...</p>";

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        console.log("Got current tab");
        chrome.tabs.sendMessage(tabs[0].id, {action: "checkPage"}, function(response) {
            console.log("Received response:", response);
            if (chrome.runtime.lastError) {
                console.log("Error:", chrome.runtime.lastError.message);
                maindiv.innerHTML = "<p>Error: " + chrome.runtime.lastError.message + "</p>";
                return;
            }
            if (response && response.isFollowersPage) {
                maindiv.innerHTML = `
                    <p>You are on the followers page!</p>
                    <button id="purgebutton">Purge the Bots</button>
                    <button id="blockthem">Block</button>
                `;
                document.getElementById('purgebutton').addEventListener('click', function() {
                    console.log("Purge button clicked");
                    chrome.tabs.sendMessage(tabs[0].id, {action: "purgeHeretics"});
                });
                document.getElementById('blockthem').addEventListener('click', function() {
                  chrome.tabs.sendMessage(tabs[0].id, {action: "testblock"});
                });
            } else {
                maindiv.innerHTML = "<p>Please navigate to a Twitter followers page to use this extension.</p>";
            }
        });
    });
});
