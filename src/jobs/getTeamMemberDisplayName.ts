import { NameFormat } from "../models/TeamCalendar";

export function getTeamMemberDisplayName(email: string, format: NameFormat) {
  switch (format) {
    case "email":
      return email;
    case "username":
      return email.split("@")[0];
    case "name":
      // fall back to querying the directory to get full name from contacts (only works in Workspace accounts)
      return (
        // not-yet-typed, see https://developers.google.com/people/api/rest/v1/people/searchDirectoryPeople
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (People.People! as any).searchDirectoryPeople({
          query: email,
          readMask: "names",
          sources: ["DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE", "DIRECTORY_SOURCE_TYPE_DOMAIN_CONTACT"],
          pageSize: 1,
        }).people?.[0]?.names?.[0]?.displayName ?? email
      );
  }
}

export function describeTeamMembers(teamMembers: string[], nameFormat: NameFormat) {
  return teamMembers.map((email) => ` - ${getTeamMemberDisplayName(email, nameFormat)}`).join("\n");
}
