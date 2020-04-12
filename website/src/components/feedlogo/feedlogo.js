import React, { memo } from "react";
import "./feedlogo.css";

const getColors = (isMonotone) => {
  let c1 = "#fff",
    c2 = "#fff",
    c3 = "#fff";
  if (!isMonotone) {
    c1 = "#3DA7CA";
    c2 = "#00698C";
    c3 = "#133540";
  }
  return { c1, c2, c3 };
};

const getWidth = (size) => `${size}px`;
const getWrapperStyle = (width, action) => ({
  width,
  height: width,
  cursor: action ? "pointer" : "default ",
});
const getClassname = (animated, i) =>
  `logo-bar bar-${i} ${animated ? `animated-logo-${i}` : ""}`;

const FeedLogo = memo(
  ({ action = null, size = 50, isMonotone = true, animated = false }) => {
    const { c1, c2, c3 } = getColors(isMonotone);
    const width = getWidth(size);
    return (
      <div
        className="column-logo"
        onClick={action}
        style={getWrapperStyle(width, action)}
      >
        <div
          className={getClassname(animated, 1)}
          style={{ backgroundColor: c1 }}
        />
        <div
          className={getClassname(animated, 2)}
          style={{ backgroundColor: c2 }}
        />
        <div
          className={getClassname(animated, 3)}
          style={{ backgroundColor: c3 }}
        />
      </div>
    );
  }
);

export default FeedLogo;
