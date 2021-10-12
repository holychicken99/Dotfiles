## What's New in 2.9.1

### Bugs fixed

-   Fixed bug preventing viewing pull requests on Bitbucket Server
-   Fixed bug preventing time tracking on Jira issues

## What's New in 2.9.0

### Improvements

-   Added support for the use of personal access tokens with Jira Server

## What's New in 2.8.6

### Improvements

-   Added URI handler to open specific Jira issue
-   Added filter for unreviewed pull requests

### Bugs fixed

-   Fixed issue preventing the extension from correctly showing that file had been renamed
-   Opening file from the pull request view no longer causes the pull request view to scroll back to the top of the page

## What's New in 2.8.5

### Improvements

-   Added messaging explaining how to disable auto-refresh
-   Close source branch option behavior now matches that of the webpage
-   Can now log work outside of traditional business hours

### Bugs fixed

-   No longer make repeated calls with invalid credentials on server instances
-   Fixed bug that caused transitioned issues to revert to the backlog
-   Fixed bug that could cause errors when adding reviewers to a pull request
-   Fixed bug preventing the pull request view from updating if a user approves their own pull request

## What's New in 2.8.4

### Improvements

-   Open Jira issue image attachments within VS Code
-   Support commit-level diffs for pull requests
-   Add missing clone config for steps in pipelines yaml validator
-   Atlassian Telemetry now respects telemetry.enableTelemetry flag in global settings

### Bugs fixed

-   Fixed summary editor size on the create pull request screen
-   Fixed styling for expander headers
-   Fixed JQL entry being erased when updating query name

## What's New in 2.8.3

### Bugs fixed

-   Create PR view now displays correctly when using high contrast theme
-   Fixed issue with markdown rendering after editing a PR comment

## What's New in 2.8.2

### Bugs fixed

-   Fixed more of the bug that caused Bitbucket Server users to not see PRs

## What's New in 2.8.1

### Bugs fixed

-   Fixed bug that caused Bitbucket Server users to not see PRs

## What's New in 2.8.0

### Improvements

-   Redesigned pull request webview UI and improved performance
-   Show images in description and comments for Jira Cloud issues
-   Markdown editor for pull request webview
-   Added support for transitioning multiple issues when a pull request is merged
-   Show priority and status in treeview tooltip for Jira issues
-   Files with comments are indicated with an icon in pull request webviews

### Bugs fixed

-   Fixed pull request filters failing for some Bitbucket Server users

## What's New in 2.7.1

### Improvements

-   Added better handling of deep links for non-authenticated users
-   Fixed typos in settings page and made top bar scrollable

### Bugs fixed

-   Comments in PR diff view no longer show up twice when the page is reloaded

## What's New in 2.7.0

### Improvements

-   Show images in comments for issues on Jira server instances
-   Add hyperlinks to attachment list in Jira issue webview
-   Markdown editor for Bitbucket Issue webview

### Bugs fixed

-   Fixed an issue affecting authenticating with sites with multi-level context paths

## What's New in 2.6.6

### Improvements

-   Removed background polling for connectivity
-   Added option in general settings to minimize errors when offline
-   Updated the create pull request view
-   Sped-up fetching lists of pull requests

## What's New in 2.6.5

### Bugs fixed

-   Branch prefix is no longer duplicated when starting work on an issue

## What's New in 2.6.4

### Improvements

-   Support for customizing the generated branch name when starting work on an issue
-   Updated Create Bitbucket Issue webview UI

### Bugs fixed

-   Fixed resource loading in webviews in VS Code Insiders

## What's New in 2.6.3

### Bugs fixed

-   Explorer no longer focuses on start up of VS Code
-   Webviews load as expected for Windows users

## What's New in 2.6.2

### Improvements

-   Better log parsing for Bitbucket Pipelines results
-   Pipeline page has been reskinned with Material UI
-   Recently merged pull requests can now be viewed in the "Bitbucket Pull Requests" explorer
-   Declined pull requests can now be viewed in the "Bitbucket Pull Requests" explorer
-   This extension now focuses the explorer after authenticating
-   A "Help and Feedback" explorer has been added
-   Pull Request preloading has been re-enabled for users with less than 4 repos open
-   Start Work message styling has been updated

### Bugs fixed

-   "Checkout Source Branch" and "Edit this File" commands now work for Bitbucket Server personal repositories
-   Logging work on cloud now works as expected
-   Adding pull request reviewers now works as expected
-   Added instructions for how to authenticate when using VS Code remotely
-   Settings for this extension no longer show up on unrelated extensions in the Extensions menu
-   Branch types are selectable again on Bitbucket Server instances
-   "Explore" tab of settings page has been restyled to be consistent with our Material UI theme
-   The "Bitbucket Pull Requests" treeview will now show the top-level directory
-   Better descriptions for some Bitbucket Pipelines configurations
-   Webviews running via Remote SSH now work in VS Code Insiders
-   High contrast color themes no longer break Webviews

## What's New in 2.6.1

### Improvements

-   Added an "Explore" tab to the settings page to help make key features more discoverable

## What's New in 2.6.0

### Improvements

-   Onboarding screen has been redesigned and reskinned with Material UI
-   Bitbucket issue screen has been redesigned and reskinned with Material UI
-   Start Work page has been reskinned with Material UI
-   Welcome page has been reskinned with Material UI
-   The settings page can now be opened from a context menu in the Extensions view
-   Support configuring preferred remotes to view pull requests

### Bugs fixed

-   A few styling issues were fixed on the settings page for light mode
-   JQL can now be edited for Jira server instances
-   Changing refresh intervals now works properly

## What's New in 2.5.1

### Bugs fixed

-   Settings page now loads properly

## What's New in 2.5.0

### Improvements

-   Refactored settings page to use new material-ui GUI
-   Rewrote JQL Editor
-   Updated Jira Filter Search
-   Authentication notification now contains buttons that perform common actions
-   When a repo has submodules, "start work" now creates branches from the parent repo by default
-   Matching criteria for mapping Bitbucket repos to sites has been relaxed

### Bugs fixed

-   Hid the Approve/Needs work buttons on Bitbucket Server PRs if current user is the PR author
-   Reply button in diff view comments now shows up for all comments
-   Fixed bug where Jira Issue were showing up blank
-   Emoji size in PR diff view comments has been fixed

## What's New in 2.4.11

### Bugs fixed

-   No longer show error for certain pipeline configurations
-   Create, Search, and Configure nodes no longer disappear from Jira sidebar

## What's New in 2.4.10

### Improvements

-   Pull Request descriptions can now be edited
-   Jira mentions are now supported from the issue description
-   Jira mentions are now supported from the description when creating an issue
-   Tab titles have been shortened for Jira/Bitbucket issues and favicons now vary
-   Remote branches can now be selected as the source branch on the "Start work on Issue" page
-   Pipelines can now be re-run from the Pipelines sidebar or the result summary page
-   The start-up time of this extension has been sped up
-   You can now start a Bitbucket Pipeline for any branch. Just open the command palette and select “Run Pipeline for Branch”

### Bugs fixed

-   Subtasks are no longer excluded from grouped JQL results
-   Autogenerated PR titles were made consistent with Bitbucket site
-   Credentials for Bitbucket Server sites can now be edited
-   Status bar no longer shows invalid issues
-   Editing an empty issue description no longer causes a rendering failure
-   Non-American style dates are now displayed correctly

## What's New in 2.4.9

### Bugs fixed

-   Fixed a bug in extension build

## What's New in 2.4.7

### Bugs fixed

-   Fixed loop that could cause infinite credential refreshing in the background

## What's New in 2.4.6

### Bugs fixed

-   Pull Request preloading has been reverted to avoid rate-limiting issues

## What's New in 2.4.4

### Bugs fixed

-   Fixed a bug in extension build

## What's New in 2.4.3

### Improvements

-   If there's only one related issue, don't make the user expand the "Related issues" section
-   Edit Jira issue descriptions
-   Added "Configure filters..." button below JQL filters in tree
-   Pull build status for Bitbucket Server
-   Exposed Jira issue results search via command palette
-   Improved PR Speed
-   Allow user to change password for server sites
-   Preload PR data
-   Stopped notifying users when URLs are copied to clipboard
-   Added repository name to pipeline messages
-   Show active Jira issue in status bar

### Bugs fixed

-   Jira issue webviews don't render well when narrow
-   Long branch names in PRs are not entirely visible
-   Merge Dialog not Readable with Dark Theme (High Contrast)

## What's New in 2.4.2

### Bugs fixed

-   Fixed certificate handling when adding new Jira sites

## What's New in 2.4.1

### Bugs fixed

-   Fix certificate handling for Jira clients

## What's New in 2.4.0

### Improvements

-   Jira explorer shows issue count for each JQL entry
-   Added ability to search for issues in the Jira explorer
-   Support mentioning users in Jira issue comments
-   Added context menu and toolbar options in pull request diff view to open the file in a new tab for editing
-   Support adding reviewers to existing pull requests
-   Support creating Bitbucket issue to parent repo when working on its fork
-   Improved support for assigning Bitbucket issues

### Bugs fixed

-   Worklog comment is optional now
-   Fixed formatting Jira issues in comments
-   Fixed pull request merge message not being updated when approval changes
-   Fixed pull request and start work screens staying permanently in loading state in some cases

## What's New in 2.3.2

### Improvements

-   Updated README to include complete build instructions
-   Improved reviewer/mention selection for Bitbucket Cloud pull requests
-   It is now possible to reply to any pull request comment in the diff view

### Bugs fixed

-   Matched cursor behavior in diff lists to the Bitbucket Cloud website
-   Cancelled tasks are now hidden and task deletion doesn't cause strange behavior
-   You can now add pull-request-level tasks in Bitbucket Cloud pull requests even when no tasks already exist

## What's New in 2.3.1

### Bugs fixed

-   Start work on issue now works correctly again

## What's New in 2.3.0

### Improvements

-   Added support for Bitbucket tasks
-   Can now edit both time and date when adding a worklog
-   Added buttons to create Jira and Bitbucket issues and pull requests to trees in side bar
-   Reduced number of Bitbucket API to reduce rate-limit errors
-   Preserve file structure when showing pull request contents in the side bar
-   Default maximum number of Jira issues fetched via JQL increased from 50 to 100
-   Added option to fetch all issues matching JQL
-   Made settings titles consistent
-   Now have different messages in sidebar when not authenticated with Bitbucket and not having a Bitbucket repo available in the current workspace
-   When adding a new Jira site default JQL for that site will now contain `resolution = Unresolved` if the site is configured to support the `resolution` field
-   Added support for pull requests from forks
-   Default reviewers are now prepopulated for pull requests from forks

### Bugs fixed

-   Fixed link to "Select merge strategy" when merging a pull request
-   Code blocks in diff-view comments now contain proper highlighting and special characters aren’t escaped
-   Fixed issue that prevented using Jira and Bitbucket instances on the same host (for real this time)
-   Comment order is now preserved after making a comment on Bitbucket Server
-   Made "Needs work" button more readable when using a dark theme
-   Can now log work on Jira Server
-   Project list is now searchable when creating an issue on Bitbucket Server
-   Fixed issue that could cause viewing files in pull requests to be slow

## What's New In 2.2.1

### Improvements

-   Added “Group issues by Epic” option to display issues in a list instead of nesting subtasks under issues and issues under Epics

### Bugs fixed

-   Fixed bug where special characters were being escaped in the status bar
-   Fixed authenticating with multi-level context paths
-   Fixed bugs causing subtasks not matching query to be included in JQL results

## What's New In 2.2.0

### Improvements

-   Support for importing Jira filters when adding custom JQL entries
-   Support editing pull request titles
-   Support for custom online check URLs

### Bugs fixed

-   Fixed bug where extension does not work when Jira and Bitbucket are set up with the same domain
-   Fixed bug where last used Jira project for creating issues was not being saved
-   Fixed bug where Jira autocomplete query was not being encoded correctly
-   Fixed bug causing internal comment button to not show up on service desk issues
-   Fixed bug preventing creation of Bitbucket issues
-   Fixed bug where create pull request view kept spinning when no repositories were open
-   Fixed issue where Jira issues show in treeview but open a blank screen when opened
-   Restrict inline commenting range for Bitbucket Server pull requests
-   Fixed delay when refreshing pull requests treeview

## What's New In 2.1.5

### Improvements

-   Added welcome screen to help new users get up and running
-   Support using existing branches when starting work on an issue

### Bugs fixed

-   Fixed issue that could prevent Windows users from adding multiple accounts
-   Allow disabling Jira or Bitbucket features globally and re-enabling them at the project level
-   Inline comments on Bitbucket Server pull requests no longer show up at the file level
-   Fixed diff view comments not refreshing after adding a new comment

## What's New In 2.1.4

### Bugs fixed

-   Fixed issue that resulted in failure to save credentials when logging in

## What's New In 2.1.3

### Improvements

-   Added tooltip text clarifying that only exact matches are allowed on Bitbucket Server when adding reviewers to a pull request
-   When available, specific error messages for git operations are now presented instead of more general error messages

### Bugs fixed

-   Jira issues are now correctly assigned when using start work on Jira Server
-   Selecting an item from the mention picker when editing a Bitbucket issue now works correctly
-   "Create in browser..." button on "Create pull request" screen now links to correct location on Bitbucket Server
-   Fixed bug that could prevent Jira issues from presenting up-to-date information

## What's New In 2.1.2

### Improvements

-   Allow extension to be used when working in remote workspaces
-   Support for adding internal comments on Jira Service Desk issues

### Bugs fixed

-   Jira issue status was empty in some cases
-   Jira issues showed duplicate transition states in some cases
-   Adding reviewers on Bitbucket Cloud pull requests would show an error
-   Code blocks in inline comments were not formatted correctly
-   Bitbucket issue creation was failing
-   Bitbucket issue sidebar styling was inconsistent
-   Fixed copy for creating pull request externally
-   Fixed link to prepare-commit-message snippet

## What's New In 2.1.1

### Improvements

-   Added support for tunneling https when using a proxy server
-   Now using a reasonable placeholder for broken images

### Bugs fixed

-   Jira issue screen broken due to missing priority field
-   Jira issue screen broken due to missing subtasks field
-   Bitbucket repos not recognized if remote URL includes a port
-   Bitbucket start work on issue not working
-   Code block in comments too dark to see in dark themes
-   Pipelines explorer filters not working properly

## What's New In 2.1.0

### Improvements

-   Clicking on a pull request preview file now opens the file
-   Added advanced SSL options to custom login screen
-   Added context path option to custom login screen
-   Now showing PR approval status in explorer tooltip

### Bugs fixed

-   Bitbucket pull request filters not working
-   Sometimes issue screen would be blank
-   Online/Offline checker sometimes gave wrong results

## What's New In 2.0.4

### Bugs fixed

-   Some Jira fields not populating due to invalid field keys

## What's New In 2.0.3

### Improvements

-   Removed the file changes count limit for pull requests
-   Webview tabs now have an Atlassian icon

### Bugs fixed

-   Create Issue page not loading in some instances
-   Webviews didn't allow images to load over http
-   Various undefined values would throw errors due to lack of boundry checking
-   Doc links fixed and various spelling corrections

## What's New In 2.0.1

### Improvements

-   Added support for plain http when connecting to server instances
-   Added experimental support for self-signed certificates

### Bugs fixed

-   Fixed Bitbucket authentication not working

## What's New In 2.0.0

### Improvements

-   Support for Jira Server and Bitbucket Server
-   Support for a wider range of Jira features and configurations
    -   Time tracking
    -   Adding sprints to issues
    -   Not having a resolution field
    -   And more!
-   View JQL from multiple sites at once in Jira explorer
-   Improved Settings
    -   Jira and Bitbucket now have their own sections in the settings
    -   Jira or Bitbucket features can now be completely disabled
    -   Settings can now be saved at either the user level or the workspace level
    -   Notifications can be managed and disabled for individual JQL queries
-   Can now collapse all comments on a pull-request
-   Selected code will now be included in description when creating issue from a TODO
-   Get the latest information by refreshing any webview
-   Improved performance when creating pull-requests or starting work on issues
-   Easily edit the branch name when starting work on an issue
-   Pre-filled mention picker when creating pull requests and Bitbucket issues
-   Editing and deleting comments in pull requests
-   Added support for merge commit messages
-   Added diff preview in pull request views
-   Added support for Bitbucket mirrors

### Bugs fixed

-   Build statuses now link to the tool that created them
-   Fixed URL creation on Windows
-   `TODO` triggers no longer require a trailing space
-   Subtasks now report the correct status
-   Pipelines builds triggered manually or by tag creation now notify correctly and show up in the pipelines side bar
-   Username was not slugified when making calls during Bitbucket server auth flow
-   Sometimes webviews would not load data
-   Transitions are now reloaded when an issue is transitioned to get any new available options
-   Fixed bad default JQL in settings.json
-   Fixed error when checking for an empty user object
-   Fixed issue with credentials not saving for all sites

## What's New In 1.4.3

### Improvements

-   Show Jira issue key in explorer

### Bugs fixed

-   Webviews show loading message when they come to focus
-   Jira issue created notifications do not show up sometimes

## What's New In 1.4.2

### Improvements

-   Allow using currentProject() in custom jql
-   Make Your/Open Issues editable custom JQL entries

### Bugs fixed

-   Comment API changes for VS Code May Updates

## What's New In 1.4.1

### Improvements

-   Updated marketplace listing name to feature Jira and Bitbucket
-   Add ability to modify a subset of fields on Jira details screen

### Bugs fixed

-   Panel text colours appear washed out in Jira webview

## What's New In 1.4.0

### Improvements

-   Store Jira working project as workspace config if possible
-   Update assignee in Jira issue view
-   Show conflicted state for a pull request file in tree view
-   Show merge checklist before merging
-   Reduce number of git calls for better performance on large PRs
-   Better emoji styling in pull request webview
-   Add loading indicator when posting comment on webviews
-   Ticket comments should include date/time metadata
-   Allow filtering of Pipelines
-   Make Bitbucket features work with SSH aliases
-   Bitbucket features work with repositories cloned with https protocol
-   Better date format on pull request commit list
-   Update to latest VS Code comments api
-   Offline detection is too aggressive
-   Use Atlassian urls for online checks
-   Authentication related fixes and improvements

### Bugs fixed

-   Epic fields are being duplicated in Jira API requests
-   Other issues from the same epic showing up in JQL results
-   Checkout source branch button doesn't update correctly
-   Pull requests with large number of files do not work properly
-   Large pull requests spawn large number of git/console host processes on refresh/comment change
-   PR comments disappearing after some time
-   Unable to start pipeline from explorer

## What's New In 1.3.1

### Bugs fixed

-   Cannot create Jira issues in certain cases if epic is not specified
-   Jira treeviews show no issues after some time

## What's New In 1.3.0

### Improvements

-   Now using port 31415 for auth listener instead of 9090
-   Added custom prefix for branches when starting work on issue
-   Added Jira epics in issue details view
-   Added ability to link to an epic on Jira create issue
-   It's now possible to create an Epic issue
-   Merge actions similar to Bitbucket webpage (merge type/close source branch etc)
-   Option to transition Jira/Bitbucket issue when creating/merging pull requests
-   Support for creating issue-links on Jira create screen
-   Added related issues and transition option to create pull request screen
-   Now showing better messaging when no Bitbucket project is open
-   Show merge conflicts in pull request treeview
-   Added non-renderable field warnings and report for Jira create issue
-   Added ability to create a Jira issue from a Bitbucket issue and link them
-   Ensure webview controllers don't refresh multiple times at once

### Bugs fixed

-   Transition menu in start work on issue does not work
-   Pull request merge fails silently when there are conflicts
-   Create pull request screen shows blank page when remote branch is deleted

## What's New In 1.2.3

### Bugs fixed

-   JQL error when opening related Jira issues in the pull request tree

## What's New In 1.2.2

### Improvements

-   Extension works with [Bitbucket's upcoming API changes](https://developer.atlassian.com/cloud/bitbucket/bitbucket-api-changes-gdpr/) related to user privacy
-   Context menu item in treeviews to open in browser
-   Support to add an issue link when creating a Jira issue

## What's New In 1.2.1

### Improvements

-   Added Jira issue links to Issue Details view
-   The configured development branch is now the default source when starting work on an issue
-   Added more default issue code link triggers
-   (experimental) bitbucket-pipelines.yml editing support
-   Added external [user guide](https://confluence.atlassian.com/display/BITBUCKET/Getting+started+with+VS+Code)

### Bugs fixed

-   Mention names in pull request comments are not shown properly
-   Transition menu on start work page not working
-   PR create screen is not splitting the title and description correctly

## What's New In 1.2.0

### Improvements

-   Start work from Bitbucket issue webview
-   Show additional information in Jira issue view (reporter, Bitbucket pull request status)
-   Add issue titles to Jira notifications
-   Option to close source branch after merge when creating pull request
-   Made pipelines header consistent with other webviews
-   Use new VS Code API for comments in pull requests

### Bugs fixed

-   Long code blocks in Jira issues break out of their column
-   Markdown doesn't render in comments on Jira issues
-   Hovering on issue key to get details not working
-   Pipeline summary fails for in-progress builds

## What's New In 1.1.0

### Improvements

-   Code hint to create issue from comment triggers
-   Add right-click create Jira issue in code view
-   Open Jira issue by key from command palette
-   Explorer for Bitbucket issues
-   Webview to create, view and update Bitbucket issues
-   Notifications for new Bitbucket issues
-   Show related Bitbucket issues in pull requests
-   Show recent Bitbucket pull requests for Jira issues
-   Improve issue created message when multiple issues are created one after another
-   Allow user to view logs from pipeline builds
-   Separate pipelines results by repo
-   Improve subtask display in treeviews to respect jql filter
-   Improvement and consistency for error messages in webviews

### Bugs fixed

-   Welcome page opens on every new window
-   Pull request comments are being duplicated when treeview is refreshed
-   Fix auth timeout tab opening randomly sometimes
-   Handle cases when default site is not selected in settings screen
-   Filter out done issues in 'Your Issues' treeview
-   Fix pipelines result display with manual deployments
-   Jira issue details were not loading completely in some cases

## What's New In 1.0.4

### Bug

-   Fixed a bug where upstream branch was not being set properly when starting work on Jira issue

## What's New In 1.0.3

### Bug

-   Fixed another case causing extension to open an authentication browser tab occasionally without user interaction

## What's New In 1.0.2

### Bug

-   Extension opens an authentication browser tab occasionally without user interaction
-   Handle treeviews gracefully when there are no Bitbucket repos
-   Jira issue view shows blank page for some issues
-   Status bar settings are reset on restart
-   Checkboxes did not reflect correct state in settings page

### Improvements

-   Render markup for description for Jira issues
-   Group sub-tasks by parent issue in tree view
-   Show parent issue link for sub-tasks in Jira details view
-   Improve styling on start work success message
-   Remove/disable start work button on issue screen if you're already on the issue branch
-   Moved site selector in settings to authorization section
-   Add site selector to the custom jql config screen
-   Support for default reviewers while creating pull requests
-   Detect dirty working tree and ask user to commit when creating PRs

## What's New In 1.0.1

### Bug

-   Extension occasionally opens up a browser window to auth until the user authenticates
-   General authentication fixes
-   Start work on issue hangs with non-Bitbucket repos
-   Custom JQL tree not refreshing when refresh button clicked
-   Length check causing View Issue page to disappear
-   Pipelines explorer not initializing properly
-   Open in Bitbucket context menu item not working on repository nodes
-   Create Pull Request hangs with non-Bitbucket Cloud repos

### Improvements

-   Add Project key to project selector list to dedupe project names
-   Add refresh button to custom JQL tree
