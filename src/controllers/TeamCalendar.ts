interface NewCalendar {
  name: string;
  teamMembers: string[];
}

export const TeamCalendarController = {
  create({name, teamMembers}: NewCalendar) {
    Logger.log(`Creating calendar ${name} with team members ${teamMembers}`)
  },
}