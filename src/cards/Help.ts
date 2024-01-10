import { GoBackAction } from "../endpoints/onGoBack";

const intro = `Vacation Calendar is a <a href="https://support.google.com/calendar/answer/9117864?hl=en">Google Calendar add-on</a> that helps you keep track of your team's availability in one combined "team calendar". Each team calendar is configured with a list of team members, and Vacation Calendar then automatically adds all of their "out of office" schedules into one Google Calendar which you can share with the team.

You can use Vacation Calendar to create one long-lived calendar for the whole team, or you might use it to create a temporary calendar for a single project. Or both! You can create as many team calendars as you like.`;

const gettingStarted = `First, an important note: Vacation Calendar uses Google Calendar's <b><a href="https://support.google.com/calendar/answer/7638168?hl=en&co=GENIE.Platform%3DDesktop#:~:text=Show%20when%20you%E2%80%99re%20out%20of%20office">out of office</a></b> feature. This means that it only works with a corporate Google Workspace plan, and your team members must be tracking their availability on their calendars with <b>out of office</b> events.

Now, to get started all you need to do is create a new team calendar. You can do this from the menu above - just click <b>New team calendar</b>.

Enter a name for your calendar and list your team members. Be sure to use each team member's official work email address and list one team member per line. The <b>Minimum event duration</b> setting allows you to filter out short events, such as when a team member has a quick appointment, keeping the calendar uncluttered.

Click <b>Save</b> and you're good to go! The new calendar will take a few minutes to populate, so wait a little while and then refresh Google Calendar to see the events.`;

export function HelpCard() {
  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Vacation Calendar Help"))
    .addSection(
      CardService.newCardSection()
        .setHeader("Introduction")
        .addWidget(CardService.newTextParagraph().setText(intro)),
    )
    .addSection(
      CardService.newCardSection()
        .setHeader("Getting Started")
        .addWidget(CardService.newTextParagraph().setText(gettingStarted)),
    )
    .addSection(
      CardService.newCardSection().addWidget(
        CardService.newTextButton().setText("Back").setOnClickAction(GoBackAction()),
      ),
    )
    .build();
}
