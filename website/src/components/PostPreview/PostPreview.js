import React, { useState, useEffect, memo } from "react";
import "./PostPreview.css";

import { extractDomain, isValidUrl, Colors } from "../../Constants";

const WIDTH_BONE_1 = { width: "20vw" };
const WIDTH_BONE_2 = { width: "10vw" };

export default memo(
  ({
    inPreviewMode,
    photoUrl,
    displayName,
    content,
    isLinkValid,
    title,
    description,
    url,
    setTitle,
    hideDescription,
    setHideDescription,
  }) => {
    const [embedImage, setEmbedImg] = useState(null);

    useEffect(() => {
      if (isLinkValid && url !== "") {
        const encoded = encodeURIComponent(url);
        fetch(`https://feedmyflow.herokuapp.com/api/v1/preview?url=${encoded}`)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error(`${res.status}: ${res.statusText}`);
          })
          .then((json) => {
            const { title, image: url } = json;
            setEmbedImg(url);
            setTitle(title);
            if (url !== undefined && url !== null) {
              setHideDescription(true);
            } else {
              setHideDescription(false);
            }
          })
          .catch((err) => {
            // console.log(err);
            setHideDescription(false);
            setEmbedImg(null);
            setTitle("");
          });
      } else if (embedImage !== null) setEmbedImg(null);
    }, [isLinkValid, url, embedImage, setTitle, setHideDescription]);

    const getLine = line => {
      const tokens = line.split(' ');
      return tokens.map(t => {
        let textStyle = { color: Colors.shade1 };
        // has hashtag with more than just the shebang or is a url (# is a valid url so we remove that case)
        if ((t[0] === '#' && t.length > 1) || (isValidUrl(t) && t !== '#'))
          textStyle = { color: Colors.light };
        return <span style={textStyle}>{`${t} `}</span>
      })
    }

    const HeaderPost = () => (
      <div className="row" style={{ marginTop: "20px" }}>
        <img src={photoUrl} alt="user-img" className="user-img" />
        <div
          className="column"
          style={{ alignItems: "flex-start", marginLeft: "20px" }}
        >
          <p style={{ margin: 0 }}>{displayName}</p>
          <div className="skeleton" style={WIDTH_BONE_1} />
          <div className="skeleton" style={WIDTH_BONE_2} />
        </div>
      </div>
    );

    const ContentPost = () => (
      <div className="row" id="post-content">
        {content.split("\n").map((line, i) => {
          return (
            <p key={i} className="next-post-item">
              {getLine(line)}
            </p>
          );
        })}
      </div>
    );

    const renderBottom = () => (
      <div className="column" style={{ width: "100%" }}>
        {embedImage && (
          <div className="img-container">
            <img src={embedImage} alt="embed" className="embed-img" />
          </div>
        )}

        {(url || title || description) &&
          <div className="url-info-container">
            <p className="description-text clipped clip-1">{title}</p>
            <p
              className="second-text"
              style={{ fontSize: "14px", margin: "6px 0 6px 0" }}
            >
              {isLinkValid ? extractDomain(url) : url}
            </p>
            {!hideDescription && <p className="description-text clipped clip-2">{description}</p>}
          </div>}
      </div>
    );

    return (
      <div className={inPreviewMode ? "card overflowable visible" : "card overflowable"} id="preview-card">
        <HeaderPost />
        <ContentPost />
        {renderBottom()}
      </div>
    );
  }
);
