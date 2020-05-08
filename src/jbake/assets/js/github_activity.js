/*
 * github_activity.js
 *
 * Updates a panel widget with the most recent GitHub event activity for a given
 * GitHub user using the GitHub API.  This script depends on JQuery, Bootstrap and
 * Octicon.
 *
 * @author Jonathan Pearlin
 * @date April 12, 2014
 */

/**
 * Capitalizes the first letter of the string.
 * @returns The capitalized string.
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Load the GitHub activity widget on the document ready event.
$(document).ready(function() {
    $.get("https://cors-anywhere.herokuapp.com/https://api.github.com/users/jdpgrailsdev/events", function(data) {
        // Remove the "Loading..." place holder.
        $('#wrap > #activity > .panel > .panel-body').remove();

        // Find the activity list from the DOM.
        var activityList = $('#wrap > #activity > .panel > ul');

        // Counter used to determine when we have found the desired number of events for display.
        var count = 0;

        // Loop over each retrieved GitHub event and process.
        $.each(data, function(i, githubEvent) {
            // The icon font to be displayed with the event.
            var octicon = "";
            // The hyper link to be applied to the displayed event.
            var link = "";
            // The text to be displayed with the event.
            var text = "";

            // Only show 10 events.  Not all types of GitHub events are implemented here.
            // for the full list, see https://developer.github.com/v3/activity/events/types/
            if(count < 10) {
                if(githubEvent.type == 'CommitCommentEvent') {
                    octicon = "octicon-comment";
                    link = githubEvent.payload.comment.html_url;
                    text = "Commented on " + githubEvent.repo.name + "/commit/" + githubEvent.payload.comment.commit_id;
                } else if(githubEvent.type == 'CreateEvent') {
                    octicon = "octicon-repo-create";
                    link = "http://github.com/" + githubEvent.repo.name;
                    text = "Created repository " + githubEvent.repo.name;
                } else if(githubEvent.type == 'ForkEvent') {
                    octicon = "octicon-repo-forked";
                    link = githubEvent.payload.forkee.html_url;
                    text = "Forked repository " + githubEvent.repo.name;
                } else if(githubEvent.type == 'IssuesEvent') {
                    octicon = "octicon-issue-" + githubEvent.payload.action;
                    link = githubEvent.payload.issue.html_url;
                    text = githubEvent.payload.action.capitalize() + " issue " + githubEvent.repo.name
                        + "#" + githubEvent.payload.issue.number;
                } else if(githubEvent.type == 'IssueCommentEvent') {
                    octicon = "octicon-comment-discussion";
                    link = githubEvent.payload.issue.html_url;
                    text = "Commented on " + (githubEvent.payload.issue.pull_request != null ? "pull request" : "issue") +
                        " " + githubEvent.repo.name + "#" + githubEvent.payload.issue.number;
                } else if(githubEvent.type == 'PullRequestEvent') {
                    octicon = 'octicon-git-pull-request';
                    link = githubEvent.payload.pull_request.html_url;
                    text = githubEvent.payload.action.capitalize() + " pull request " + githubEvent.repo.name
                        + "#" + githubEvent.payload.number;
                } else if(githubEvent.type == 'PullRequestReviewCommentEvent') {
                    octicon = "octicon-comment";
                    link = githubEvent.payload.comment.html_url;
                    text = "Commented on pull request " + githubEvent.repo.name + "#"
                        + extractPullRequestNumber(githubEvent.payload.comment.pull_request_url);
                } else if(githubEvent.type == 'PushEvent' && !(githubEvent.repo.name == "jdpgrailsdev/blog")) {
                    octicon = "octicon-git-commit";
                    link = "http://github.com/" + githubEvent.repo.name + "/commit/" + githubEvent.payload.head;
                    text = "Pushed to " + normalizeBranch(githubEvent.payload.ref) + " at " + githubEvent.repo.name;
                }

                // If the event is one of the supported types, add a new line item to the HTML panel.
                if(text) {
                    var eventDateHtml = createEventDateHtml(githubEvent.created_at);
                    activityList.append("<li id=\"" + githubEvent.id + "\" class=\"list-group-item\"><div><span class=\"octicon " +
                        octicon + "\"></span><a href=\"" + link + "\" target=\"_blank\"> " + text + "</a></div>" + eventDateHtml + "</li>");
                    count++;
                }
            }
        });

        // If no events were found, display the "No recent activity" message.
        if(count == 0) {
            activityList.append("<li class=\"list-group-item\"><div><span class=\"octicon octicon-x\"></span>" +
                "<a href=\"https://github.com/jdpgrailsdev?tab=activity\" target=\"_blank\"> No recent activity</a></li>");
        }

        // Add a link to the end of the list to see all of the activity on GitHub.com.
        activityList.append("<li class=\"list-group-item\"><div><span class=\"octicon octicon-rss\"></span>" +
            "<a href=\"https://github.com/jdpgrailsdev?tab=activity\" target=\"_blank\"> See all activity @ GitHub</a></li>");
    }).fail(function() {
        $('#wrap > #activity > .panel > .panel-body').remove();
        $('#wrap > #activity > .panel > ul').append("<li class=\"list-group-item\"><span class=\"octicon octicon-alert\"></span>GitHub activity could not be retrieved.</li>");
    });
});

/**
 * Generates an HTML snippet that contains a amount of time in days
 * that has passed between the provided date string and now.  If the
 * difference is zero days, the string "today" is added to the HTML.
 * If the difference is one day, the string "a day ago" is added to
 * the HTML.  Otherwise, the string "x days ago", where x is the
 * difference in days between the provided date and now, is added
 * to the HTML.
 *
 * @param createdAt a string representation of a date.
 * @returns The amount of time in prose that has passed between
 *   the provided date and now.
 */
function createEventDateHtml(createdAt) {
    var elapsedDays = getElapsedDays(new Date(createdAt));
    var dateText = "";

    switch(elapsedDays) {
        case 0:
            dateText = "today";
            break;
        case 1:
            dateText = "a day ago";
            break;
        default:
            dateText = elapsedDays + " days ago";
            break;
    }

    return "<div class=\"relativeTime\">" + dateText + "</div>";
}

/**
 * Extracts the GitHub pull request number from the GitHub API pull request
 * URL.
 * @param A GitHub API pull request URL.
 * @returns The pull request number extracted from the provided URL.
 */
function extractPullRequestNumber(pullRequestUrl) {
    var index = pullRequestUrl.lastIndexOf("/");
    return pullRequestUrl.substring(index+1);
}

/**
 * Determines the number of days that have elapsed between the provided
 * date and now.
 * @param startingDate A Date object that is to be compared to today to
 *   determine the number of elapsed days.
 * @return The difference in days betwee now and the provided date.
 */
function getElapsedDays(startingDate) {
    return Math.floor((new Date() - startingDate)/(24 * 60 * 60 * 1000));
}

/**
 * Removes the Git prefix from a branch reference.  For instance,
 * an input of "refs/head/master" would result in the function
 * returning the value "master".
 * @param branchRef The Git branch reference as a string.
 * @return The normalized branch name with the Git metadata
 *   removed from the branch name.
 */
function normalizeBranch(branchRef) {
    return branchRef.replace("refs/heads/","");
}