import React, { useState, useEffect, useRef } from "react";
import DateSeparator from "./DateSeparator";
import { formatChatDate } from "../../utils/messageUtils";

const StickyDateHeader = ({ messages, containerRef }) => {
  const [visibleDate, setVisibleDate] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!containerRef?.current || messages.length === 0) return;

    const container = containerRef.current;

    // Create intersection observer to detect which date separator is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dateElement = entry.target;
            const date = dateElement.dataset.date;
            if (date) {
              setVisibleDate(date);
              setIsVisible(true);
            }
          }
        });
      },
      {
        root: container,
        rootMargin: "-100px 0px 0px 0px", // Trigger when date separator is 100px from top
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    // Observe all date separators
    const dateSeparators = container.querySelectorAll("[data-date-separator]");
    dateSeparators.forEach((separator) => {
      observer.observe(separator);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [messages, containerRef]);

  // Don't show sticky header if no messages or no visible date
  if (!isVisible || !visibleDate || messages.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-30 pointer-events-none">
      <div className="pointer-events-auto">
        <DateSeparator
          date={visibleDate}
          isSticky={true}
          className="animate-in slide-in-from-top-2 duration-200"
        />
      </div>
    </div>
  );
};

export default StickyDateHeader;
