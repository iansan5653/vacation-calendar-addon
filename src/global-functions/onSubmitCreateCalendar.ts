import { createCalendarFormFields } from "../cards/CreateCalendarForm";
import { TeamCalendarController } from "../controllers/TeamCalendar";
import { GlobalFunction } from "./GlobalFunction";

export const onSubmitCreateCalendar: GlobalFunction = ({ commonEventObject }) => {
  const name =
    commonEventObject.formInputs[createCalendarFormFields.name]?.stringInputs?.value[0] ?? "";

  const teamMembers =
    commonEventObject.formInputs[
      createCalendarFormFields.teamMembers
    ]?.stringInputs?.value[0]?.split("\n") ?? [];

  TeamCalendarController.create({ name, teamMembers });
};
