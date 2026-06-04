import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const resetAllScrolls = () => {
      // Reset window scroll
      window.scrollTo(0, 0);
      
      // Reset all scrollable container elements (e.g. main dashboard panels)
      const scrollables = document.querySelectorAll("main, .overflow-y-auto, [class*='overflow-y-scroll']");
      scrollables.forEach((el) => {
        el.scrollTop = 0;
      });
    };

    // Reset immediately on path changes
    resetAllScrolls();

    // Listen to click events to handle tab/module switching inside dashboards
    const handleDocumentClick = (e: MouseEvent) => {
      // Small timeout to allow React tab state transitions to render new components
      setTimeout(resetAllScrolls, 0);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [pathname]);

  return null;
}
