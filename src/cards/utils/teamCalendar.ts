import { formatDistanceToNow } from "date-fns";
import { SyncStatus } from "../../models/TeamCalendar";

export function syncStatusText(syncStatus: SyncStatus) {
  switch (syncStatus.state) {
    case "error":
      return `⚠️ Failed to sync: ${syncStatus.message}`;

    case "pending":
      return "Syncing...";

    case "success":
      return `Synced ${formatDistanceToNow(syncStatus.timestamp)} ago`;
  }
}
