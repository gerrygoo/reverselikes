import DOMPurify from "dompurify";
import { Post } from "./api";

// Post bodies are HTML written by other Tumblr users, so always sanitize.
function Html({ html }: { html: string | undefined }) {
  if (!html) return null;
  return <div className="post-html" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}

function PostBody({ post }: { post: Post }) {
  switch (post.type) {
    case "photo":
      return (
        <>
          {post.photos?.map(({ original_size: img }) => (
            <img
              key={img.url}
              className="photo"
              src={img.url}
              width={img.width}
              height={img.height}
              loading="lazy"
              alt=""
              // Many old Tumblr images are gone; hide them rather than show a broken box.
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ))}
        </>
      );
    case "text":
      return (
        <>
          {post.title && <h2>{post.title}</h2>}
          <Html html={post.body} />
        </>
      );
    case "quote":
      return (
        <blockquote>
          <p>{post.text}</p>
          <Html html={post.source} />
        </blockquote>
      );
    case "answer":
      return (
        <>
          <div className="question">
            <strong>{post.asking_name ?? "Anonymous"} asked:</strong> <Html html={post.question} />
          </div>
          <Html html={post.answer} />
        </>
      );
    case "link":
      return (
        <>
          <a href={post.url} target="_blank" rel="noreferrer">
            {post.title || post.url}
          </a>
          <Html html={post.description} />
        </>
      );
    default:
      return post.summary ? <p>{post.summary}</p> : null;
  }
}

export function PostCard({ post }: { post: Post }) {
  const likedAt = new Date(post.liked_timestamp * 1000).toLocaleString();
  return (
    <article className="post">
      <div className="post-meta">
        Liked {likedAt} · {post.type} from {post.blog_name}
      </div>
      <PostBody post={post} />
      {post.tags.length > 0 && <div className="post-tags">{post.tags.map((t) => `#${t}`).join(" ")}</div>}
      <a className="post-link" href={post.post_url} target="_blank" rel="noreferrer">
        {post.post_url}
      </a>
    </article>
  );
}
