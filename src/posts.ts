export interface PhotoData {
    url: string;
    width: number;
    height: number;
}

export interface Photo {
    alt_sizes?: Array<PhotoData>;
    caption: string;
    original_size: PhotoData;
}

export interface Blog {
    description: string;
    name: string;
    title: string;
    updated: string;
    url: string;
    uuid: string;
}

export interface Post {
    blog: Blog;
    type: 'answer' | 'photo' | 'text' | 'quote' | string;
    body?: string;
    post_url: string;
    image_permalink?: string;
    photos?: Array<Photo>;
    liked_timestamp: number;
    text?: string;
    tags: string[];
}

export interface ResponseLinks {
    next: {
        href: string;
        method: string;
        query_params: { before: number }
    };
    prev: {
        href: string;
        method: string;
        query_params: { after: number }
    };
}

export interface Likes {
    liked_posts: Array<Post>;
    liked_count: number;
    _links: ResponseLinks;
}

export interface Response {
    response: Likes;
    meta: any;
}

export const fetchLikes = (blog: string, after: number): Promise<Response> => {
    return fetch(`https://api.tumblr.com/v2/blog/${blog}/likes?api_key=9MwDZZAj31FhNqKXu2wDVgyToi7AvyfWLZbAyl5B1JBuxUMvjD&after=${after}`)
        .then( res => res.json() );
}
