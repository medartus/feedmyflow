import React, { memo } from 'react';
import "./feedlogo.css"

const getColors = isMonotone => {
    let c1 = "white", c2 = "white", c3 = "white";
    if (!isMonotone) {
        c1 = "#3DA7CA";
        c2 = "#00698C";
        c3 = "#133540";
    }
    return { c1, c2, c3 };
}

const getWidth = size => `${size}px`;

const FeedLogo = memo(({ action = null, size = 50, isMonotone = true, animated = false }) => {
    const { c1, c2, c3 } = getColors(isMonotone);
    const width = getWidth(size);
    return (
        <div className="column-logo" onClick={action} style={{ width, height: width, cursor: action ? "pointer" : "default" }}>
            <div className={`logo-bar bar-1 ${animated ? "animated-logo-1" : ""}`} style={{ backgroundColor: c1 }} />
            <div className={`logo-bar bar-2 ${animated ? "animated-logo-2" : ""}`} style={{ backgroundColor: c2 }} />
            <div className={`logo-bar bar-3 ${animated ? "animated-logo-3" : ""}`} style={{ backgroundColor: c3 }} />
        </div>
    )
});

export default FeedLogo;