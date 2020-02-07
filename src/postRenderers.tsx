import * as React from "react";
import { Post } from "./posts";

import { styles } from "./styles";
import { CSSProperties } from "react";

export const photoPost = (measure, rowStyle: CSSProperties, index: number, post: Post) => {
    const date = new Date();
    date.setTime(post.liked_timestamp * 1000);

    return (
        <div style={{ ...rowStyle, ...styles.photoPost }}>
            <div style={styles.postRow} >{`${index}, on ${date.toLocaleString()}. Type: ${post.type}`}</div>
            {`Tags: ${post.tags.join()}`}
            <a
                style={styles.postRow}
                href={post.post_url}
                target='_blank'
            >{post.post_url}</a>
            {post.photos &&
                post.photos.map(photo => (
                    <img
                        style={{
                            ...styles.image,
                            maxWidth: photo.original_size.width,
                        }}
                        onLoad={measure}
                        src={photo.original_size.url}
                        key={photo.original_size.url}
                    />
                ))}
            {post.type === "text" && (
                <div dangerouslySetInnerHTML={{ __html: post.body! }} />
            )}
            {post.type === "quote" && <div>{post.text!}</div>}
        </div>
    );
};
