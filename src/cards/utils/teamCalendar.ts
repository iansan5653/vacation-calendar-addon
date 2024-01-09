import { formatDistanceToNow } from "date-fns";
import { SyncStatus } from "../../models/TeamCalendar";

export function syncStatusText(syncStatus: SyncStatus) {
  switch (syncStatus.state) {
    case "error":
      return `⚠️ Failed to sync: ${syncStatus.message}`;

    case "rebuilding":
      return "Rebuilding...";

    case "building":
      return "Building...";

    case "success":
      return `Updated ${formatDistanceToNow(syncStatus.timestamp)} ago`;
  }
}
