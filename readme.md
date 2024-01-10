# 🏝️ Vacation Calendar

Vacation Calendar is a Google Calendar add-on that compiles your team's
[out of office](https://support.google.com/calendar/answer/7638168?hl=en&co=GENIE.Platform%3DDesktop#:~:text=Show%20when%20you%E2%80%99re%20out%20of%20office)
events into a single calendar so that you can track availability in one place. The add-on makes it
easy to create many of these calendars: you might have one calendar for the whole team, then
temporary calendars for each project underway. These are just regular Google Calendar calenders and
can easily be customized and shared.

Vacation Calendar only works with corporate Google Workspace accounts and team members must be using
the
[out of office](https://support.google.com/calendar/answer/7638168?hl=en&co=GENIE.Platform%3DDesktop#:~:text=Show%20when%20you%E2%80%99re%20out%20of%20office)
functionality.

## Installation

> [!NOTE] If you are a GitHub employee, please reach out to `@iansan5653` on Slack for the easy way
> to get access to this addon.

This addon is still under development and not yet publicly published. That said, you can still test
it out at your own risk:

1. Clone this repository on a system with Node installed
   (`git clone https://github.com/iansan5653/vacation-calendar-addon.git`)
2. [Create a new Google Apps Script project](https://script.google.com/home/projects/create)
3. In your new project, navigate to **Project settings** and copy the **Script ID**
4. In the cloned repository, update the `scriptId` field in `.clasp.json`
5. Run `npm install`
6. Run `npm run login` and log in to your Google account at the link provided
7. Run `npm run push` to push the code to your project
8. Back in your Google Apps Script project, click **Deploy**, then **Test deployments**
9. Click **Install** and accept the permissions
10. Navigate to Google Calendar. You should see the new icon in the right-hand sidebar

## Screenshots

| Home                                                              | Calendar management                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------- |
| ![Screenshot of the add-on home page](./docs/screenshot-home.png) | ![Screenshot of a calendar management page](./docs/screenshot-calendar.png) |
