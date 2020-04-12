import React, { useState, useEffect, memo } from "react";
import "./PostPreview.css";

import { extractDomain } from "../../Constants";

export default memo(
  ({
    photoUrl,
    displayName,
    content,
    isLinkValid,
    title,
    description,
    url,
    setTitle,
    setDescription,
  }) => {
    const [embedImage, setEmbedImg] = useState(null);

    useEffect(() => {
      if (isLinkValid) {
        fetch(`https://url-preview.herokuapp.com/api/v1/preview?url=${url}`)
          .then((res) => res.json())
          .then((json) => {
            const { title, image: url, description } = json;
            setEmbedImg(url);
            setTitle(title);
            setDescription(description);
          })
          .catch((err) => console.error(err));
      } else if (embedImage !== null) setEmbedImg(null);
    }, [isLinkValid, url, embedImage, setTitle, setDescription]);

    return (
      <div className="column card" style={{ overflowY: "scroll" }}>
        <div className="row" style={{ marginTop: "20px" }}>
          <img src={photoUrl} alt="user-img" className="user-img" />
          <div
            className="column"
            style={{ alignItems: "flex-start", marginLeft: "20px" }}
          >
            <p style={{ margin: 0 }}>{displayName}</p>
            <div className="skeleton" style={{ width: "30vw" }} />
            <div className="skeleton" style={{ width: "10vw" }} />
          </div>
        </div>
        <div className="row">
          <p className="next-post-item" style={{ margin: 0 }}>
            {content}
          </p>
        </div>
        {embedImage && (
          <div className="column" style={{ position: "relative" }}>
            <img src={embedImage} alt="embed" className="embed-img" />
            <div className="column url-info-container">
              <p className="description-text clipped clipped-1">{title}</p>
              <p
                className="second-text"
                style={{ fontSize: "14px", margin: "6px 0 6px 0" }}
              >
                {extractDomain(url)}
              </p>
              <p className="description-text clipped clipped-2">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);
