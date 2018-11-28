import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
// import {  } from 'react-infinite-scroller';
import { likes, Post } from './posts';
// import * as ReactDOM from 'react-dom';

export interface AppState {
    blog: string;
    posts: Array<Post>;
    after: number;
}

export class App extends React.Component<{}, AppState> {
    state = {
        blog: 'gerardo-ga',
        posts: [] as Array<Post>,
        after: 788918400, // beginning of tumblr time
    };

    public componentDidMount() {
        this.loadLikes();



    }

    public render = () => {
        const script = document.createElement("script");
        script.src = "https://assets.tumblr.com/post.js";
        // script.async = true;
        script.defer = true;

        document.body.appendChild(script);
        return ( <div>
        <p>Likes</p>
        {/* <div
            dangerouslySetInnerHTML={{
                __html:
                    this.state.posts.map(
                        post =>
                            `<div
                                class="tumblr-post"
                                data-href="https://embed.tumblr.com/embed/post/${post.blog.uuid.substring(2)}/${post.post_url.match(/\/post\/(\w+)/)![1]}"
                            >
                            </div>
                            `
                    ).reduce( (acc, cur) => acc + cur, '' )
            }}
        /> */}

        {/* <InfiniteScroll
            initialLoad
            pageStart={0}
            loadMore={ () => this.loadLikes() }
            loader={<div className="loader" key={0}>Loading ...</div>}
        > */}

        {/* {this.state.posts.map(
            post =>
                <iframe
                    key={post.post_url}
                    className="tumblr-embed"
                    src={`https://embed.tumblr.com/embed/post/${post.blog.uuid.substring(2)}/${post.post_url.match(/\/post\/(\w+)/)![1]}`}
                    allowFullScreen
                    frameBorder={0}
                    style={{
                         display:' block',
                         padding:' 0px',
                         margin: '10px',
                         border:' none',
                         visibility: 'visible',
                         width:' 542px',
                         minHeight:'200px',
                         maxWidth: '100%',
                         height: "auto",
                    }}
                /> */}
        }

        {this.state.posts.map(
            post =>
                <div
                    key={post.post_url}
                    className="tumblr-post"
                    data-href={`https://embed.tumblr.com/embed/post/${post.blog.uuid.substring(2)}/${post.post_url.match(/\/post\/(\w+)/)![1]}`}
                />
            // <div
            //     key={post.post_url}
            //     dangerouslySetInnerHTML={{
            //         __html: `
            //         <div
            //             class="tumblr-post"
            //             data-href="https://embed.tumblr.com/embed/post/${post.blog.uuid.substring(2)}/${post.post_url.match(/\/post\/(\w+)/)![1]}">
            //         </div>
            //         `
            //     }}
            // />
        )}

        {/* </InfiniteScroll> */}
        </div>);
    }

    private async loadLikes() {
        const res = await likes(this.state.blog, this.state.after);
        const { response: { _links: links, liked_posts: new_likes } } = { ...res };
        const { prev: { query_params: { after } } } = links;
        console.log('likes are');
        console.log(new_likes);
        this.setState({
            posts: this.state.posts.concat(new_likes.reverse()),
            after,
        });
    }

}