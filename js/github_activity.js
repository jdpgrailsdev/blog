String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).ready(function() {
	$.get("https://api.github.com/users/jdpgrailsdev/events", function(data) {
		$('#wrap > #activity > .panel > .panel-body').remove();
		var count = 0;
		var activityList = $('#wrap > #activity > .panel > ul');
		$.each(data, function(i, githubEvent) {
			var octicon = "";
			var link = "";
			var title = "";
			if(count < 10) {
				if(githubEvent.type == 'CommitCommentEvent') {
					octicon = "octicon-comment";
					link = githubEvent.payload.comment.html_url;
					title = "Commented on " + githubEvent.repo.name + "/commit/" + githubEvent.payload.comment.commit_id;
				} else if(githubEvent.type == 'CreateEvent') {
					octicon = "octicon-repo-create";
					link = "http://github.com/" + githubEvent.repo.name;
					title = "Created repository " + githubEvent.repo.name;
				} else if(githubEvent.type == 'ForkEvent') {
					octicon = "octicon-repo-forked";
					link = githubEvent.payload.forkee.html_url;
					title = "Forked repository " + githubEvent.repo.name;
				} else if(githubEvent.type == 'IssuesEvent') {
					octicon = "octicon-issue-" + githubEvent.payload.action;
					link = githubEvent.payload.issue.html_url;
					title = githubEvent.payload.action.capitalize() + " issue " + githubEvent.repo.name 
						+ "#" + githubEvent.payload.issue.number; 
				} else if(githubEvent.type == 'IssueCommentEvent') {
					octicon = "octicon-comment-discussion";
					link = githubEvent.payload.issue.html_url;
					title = "Commented on " + (githubEvent.payload.issue.pull_request.url != null ? "pull request" : "issue") + 
						" " + githubEvent.repo.name + "#" + githubEvent.payload.issue.number;
				} else if(githubEvent.type == 'PullRequestEvent') {					
					octicon = 'octicon-git-pull-request';
					link = githubEvent.payload.pull_request.html_url;
					title = githubEvent.payload.action.capitalize() + " pull request " + githubEvent.repo.name 
						+ "#" + githubEvent.payload.number;
				} else if(githubEvent.type == 'PullRequestReviewCommentEvent') {
					octicon = "octicon-comment";
					link = githubEvent.payload.comment.html_url;
					title = "Commented on pull request " + githubEvent.repo.name + "#" 
						+ extractPullRequestNumber(githubEvent.payload.comment.pull_request_url);
				} else if(githubEvent.type == 'PushEvent') {
					octicon = "octicon-git-commit";
					link = "http://github.com/" + githubEvent.repo.name + "/commit/" + githubEvent.payload.head;
					title = "Pushed to " + normalizeBranch(githubEvent.payload.ref) + " at " + githubEvent.repo.name;
				}
				
				if(title) {
					var eventDateHtml = createEventDateHtml(githubEvent.created_at);
					activityList.append("<li id=\"" + githubEvent.id + "\" class=\"list-group-item\"><div><span class=\"octicon " + 
						octicon + "\"></span><a href=\"" + link + "\" target=\"_blank\"> " + title + "</a></div>" + eventDateHtml + "</li>");
					count++;
				}				
			}		
		});
		
		// Add a link to the end of the list to see all of the activity on GitHub.com.
		activityList.append("<li class=\"list-group-item\"><div><span class=\"octicon octicon-rss\"></span>" + 
			"<a href=\"https://github.com/jdpgrailsdev?tab=activity\" target=\"_blank\"> See all activity @ GitHub</a></li>");
	}).fail(function() {
		$('#wrap > #activity > .panel > .panel-body').remove();
		$('#wrap > #activity > .panel > ul').append("<li class=\"list-group-item\"><span class=\"octicon octicon-alert\"></span>GitHub activity could not be retrieved.</li>");
	});
 });

function createEventDateHtml(createdAt) {
	var elapsedDays = getElapsedDays(new Date(createdAt));
	switch(elapsedDays) {
		case 0:
			return "<div class=\"relativeTime\">today</div>";			
		case 1:
			return "<div class=\"relativeTime\">a day ago</div>";
		default:
			return "<div class=\"relativeTime\">" + elapsedDays + " days ago</div>";
	}
}

function extractPullRequestNumber(pullRequestUrl) {
	var index = pullRequestUrl.lastIndexOf("/");
	return pullRequestUrl.substring(index+1);
}

function getElapsedDays(startingDate) {
	return Math.floor((new Date() - startingDate)/(24 * 60 * 60 * 1000));
}

function normalizeBranch(branchRef) {
	return branchRef.replace("refs/heads/","");
}