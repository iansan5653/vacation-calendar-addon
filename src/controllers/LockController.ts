import { differenceInMinutes, differenceInSeconds } from "date-fns";

const PREFIX = "LOCK_";
const lockKey = (key: string) => `${PREFIX}${key}`;

/**
 * Unlike the built in `LockService`, this controller allows you to lock on a specific key.
 * This is useful for resource-based locking and/or for obtaining the same lock across multiple
 * code paths.
 */
export const LockController = {
  lock(key: string) {
    // important to native lock here to avoid a write in between read and write
    const nativeLock = LockService.getUserLock();
    nativeLock.waitLock(2000);

    if (LockController.isLocked(key)) throw new Error(`Lock for ${key} already obtained`);
    PropertiesService.getUserProperties().setProperty(lockKey(key), new Date().toISOString());

    nativeLock.releaseLock();
  },
  isLocked(key: string) {
    const str = PropertiesService.getUserProperties().getProperty(lockKey(key));
    if (!str) return false;

    if (differenceInMinutes(new Date(), new Date(str)) > 30) {
      Logger.log(`${key} lock was stale for more than 30 minutes, releasing it`);
      LockController.release(key);
      return false;
    }

    return true;
  },
  release(key: string) {
    PropertiesService.getUserProperties().deleteProperty(lockKey(key));
  },
  withLock:
    <T>(key: string, timeoutSeconds: number) =>
    (fn: () => T): T => {
      Logger.log(`Attempting to obtain lock for ${key}`);

      const startTime = new Date();
      let lockObtained = false;
      while (!lockObtained) {
        try {
          LockController.lock(key);
          lockObtained = true;
        } catch (e) {
          const elapsed = differenceInSeconds(new Date(), startTime);
          if (elapsed > timeoutSeconds)
            throw new Error(`Failed to obtain ${key} lock after ${elapsed} seconds`);
        }

        Utilities.sleep(500);
      }

      Logger.log(
        `Obtained ${key} lock after ${differenceInSeconds(new Date(), startTime)} seconds`,
      );

      try {
        return fn();
      } finally {
        LockController.release(key);
        Logger.log(`Released ${key} lock`);
      }
    },
};
