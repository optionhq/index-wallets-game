import { useCallback, useEffect } from "react";

export const useWakeLock = () => {
  const acquireWakeLock = useCallback(
    async () =>
      "wakeLock" in navigator
        ? await navigator.wakeLock.request("screen").catch(() => undefined)
        : undefined,
    [],
  );

  useEffect(() => {
    acquireWakeLock();
  }, [acquireWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        acquireWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [acquireWakeLock]);
};

export default useWakeLock;
