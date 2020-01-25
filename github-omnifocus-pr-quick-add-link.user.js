// ==UserScript==
// @name         GitHub -> OmniFocus - PR Quick Add Link
// @version      1.0.2
// @description  Adds a shortcut to pull requests on GitHub so that you can quickly send them to OmniFocus.
// @namespace    https://github.com/cddude229/userscripts
// @supportURL   https://github.com/cddude229/userscripts/issues
// @author       Chris Dessonville
// @match        https://github.com/*
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// SETTINGS - Leave strings blank to disable - target settings are defined in https://inside.omnifocus.com/url-schemes
var targetProject = "Sumo Logic : Reviews / Blockers"; // Use colon to separate folders from projects
var targetDueDate = "today 5pm"; // Uses built-in omni format.  Except "today" alone may not have right time of day
var targetTags = ""; // Comma-separated list of tags
// END SETTINGS

/*
  CHANGE LOG:
  1.0.2
  - Don't include hashes in the URL added to OmniFocus
  1.0.1
  - Fixed accidental double white space
  1.0.0
  - Initial release of script
*/


// TODO:
// - Add more UserScript metadata tags

(function() {
    'use strict';

    var addLink = function() {
        if (location.href.match(/\/pull\//)) {
            var omniFocusLink = document.createElement("a");
            omniFocusLink.innerHTML = "+OF";
            omniFocusLink.href = "javascript:void(0);";

            var target = document.querySelector("div.timeline-comment-header div.timeline-comment-actions details");
            target.parentNode.insertBefore(omniFocusLink, target);

            var username = document.querySelector("div.timeline-comment-header a.author").innerHTML;
            var usernameApiUrl = "https://api.github.com/users/" + username;

            GM.xmlHttpRequest({
                method: "GET",
                url: usernameApiUrl,
                onload: function(response) {
                    var result = JSON.parse(response.responseText);

                    var fullName = result["name"] || username; // Fallback to username if name isn't set
                    var prId = location.href.match(/pull\/(\d+)/) ? RegExp.$1 : -1;

                    var omniName = "PR " + prId + " - Review for " + fullName;
                    var omniNote = location.protocol + "//" + location.host + location.pathname;

                    var addArgIfDefined = function(argName, value) {
                        if (value) {
                            return "&" + argName + "=" + encodeURIComponent(value);
                        } else {
                            return "";
                        }
                    };

                    var omniUrl = "omnifocus:///add?" +
                        addArgIfDefined("name", omniName) +
                        addArgIfDefined("note", omniNote) +
                        addArgIfDefined("project", targetProject) +
                        addArgIfDefined("due", targetDueDate) +
                        addArgIfDefined("tags", targetTags);

                    omniFocusLink.href = omniUrl;
                }
            });
        }
    }

    document.addEventListener("pjax:success", addLink); // https://github.com/defunkt/jquery-pjax/#events and https://github.com/Mottie/GitHub-userscripts/wiki/How-to
    addLink();
})();
