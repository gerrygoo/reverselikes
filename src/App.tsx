import * as React from 'react';
import { likes, Post } from './posts';
import { List, WindowScroller, InfiniteLoader } from 'react-virtualized';
export interface AppState {
    blog: string;
    posts: Array<Post>;
    after: number;
    fontSize: number;
    lineHeight: number;
}

export class App extends React.Component<{}, AppState> {
    state = {
        blog: 'gerardo-ga',
        posts: [] as Array<Post>,
        after: 788918400, // beginning of tumblr time
        fontSize: 14,
        lineHeight: 20,
    };

    public componentDidMount() {
        this.loadLikes();

        const el = document.getElementById('root');
        const style = window.getComputedStyle(el!, null).getPropertyValue('font-size');
        const lineHeightStyle = window.getComputedStyle(el!, null).getPropertyValue('line-height');
        const fontSize = parseFloat(style);
        const lineHeight = parseFloat(lineHeightStyle);

        this.setState({ fontSize, lineHeight });
    }

    public render = () => <div style={{ backgroundColor: 'rgb(54,70,93)', display: 'flex', justifyContent: 'center' }}>
        <InfiniteLoader
            isRowLoaded={(idx) => this.isRowLoaded(idx)}
            loadMoreRows={(idx) => this.loadMoreRows(idx)}
            rowCount={3000}
        >
            {({ onRowsRendered, registerChild }) => (
                <WindowScroller>
                    {({ height, isScrolling, onChildScroll, scrollTop }) => (
                        <List
                            autoHeight
                            height={height}
                            isScrolling={isScrolling}
                            onScroll={onChildScroll}
                            scrollTop={scrollTop}

                            onRowsRendered={onRowsRendered}

                            // width={ window.innerWidth }
                            width={window.innerWidth / (1.5)}

                            ref={registerChild}
                            rowCount={this.state.posts.length}
                            rowHeight={(idx) => this.rowHeight(idx)}
                            rowRenderer={(confObj) => this.rowRenderer(confObj)}

                            onScoll={({ clientHeight, scrollHeight, scrollTop }) => console.log(clientHeight, scrollHeight, scrollTop)}
                        />
                    )}
                </WindowScroller>
            )}
        </InfiniteLoader>

    </div>;

    private async loadLikes() {
        // console.log('getting likes');
        const res = await likes(this.state.blog, this.state.after);
        const { response: { _links: links, liked_posts: new_likes } } = { ...res };
        const { prev: { query_params: { after } } } = links;
        console.log(new_likes);
        this.setState({
            posts: this.state.posts.concat(new_likes.reverse()),
            after,
        });
    }

    private async loadMoreRows({ startIndex, stopIndex }) {
        // console.log(`wanna load rows ${startIndex} to ${stopIndex}`);
        // console.log(startIndex, this.state.posts.length);
        if (startIndex > this.state.posts.length) {
            await this.loadLikes();
        }
    }

    private isRowLoaded({ index }) {
        return index <= this.state.posts.length;
    }

    private textHeight(text: string) { // BEWARE new lines are like on the regex
        const { fontSize, lineHeight } = this.state;

        const lines = (
            ((text.length * fontSize * 1.3 ) / window.innerWidth) +
            (text.match(/<\/p>\n<p>/gi) ? text.match(/<\/p>\n<p>/gi)!.length : 0) * 2
        );

        // console.log(lines, lineHeight, lines*lineHeight, fontSize);
        return lines * lineHeight;
    }

    private rowHeight({ index }): number {
        const post: Post = this.state.posts[index];
        const photosHeight = (post && post.photos) ? post.photos!.map(photo => photo.original_size.height).reduce((acc, cur) => acc + cur) : 0;
        const bodyHeight = post.body ? this.textHeight(post.body) : 0;
        const textHeight = post.text ? this.textHeight(post.text) : 0;

        return photosHeight + bodyHeight + textHeight + 70;
    }

    private rowRenderer({
        key,         // Unique key within array of rows
        index,       // Index of row within collection
        isScrolling, // The List is currently being scrolled
        isVisible,   // This row is visible within the List (eg it is not an overscanned row)
        style        // Style object to be applied to row (to position it)
    }) {
        const post = this.state.posts[index];

        const date = new Date();
        date.setTime(post.liked_timestamp * 1000);

        if ( post.type == 'quote' ) console.log(post);

        return (
            <div
                key={key}
                style={{
                    ...style,
                    backgroundColor: 'white',
                    // justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ alignSelf: 'flex-start' }} >{`On ${date.toLocaleString()}. Type: ${post.type}`}</div>
                <a style={{ alignSelf: 'flex-start' }} >{post.post_url}</a>
                {post.photos &&
                    post.photos.map(
                        photo =>
                            <img
                                style={{
                                    display: 'block',
                                    width: 'inherit',
                                    // alignSelf: 'center',
                                    // justifySelf: 'center',
                                    maxWidth: photo.original_size.width,
                                }}
                                key={photo.original_size.url}
                                src={photo.original_size.url}
                            />
                    )
                }
                {post.type === 'text' &&
                    <div
                        dangerouslySetInnerHTML={{__html: post.body!}}
                    />
                }
                {post.type === 'quote' &&
                    <div>{post.text!}</div>
                }
                <div style={{ height: 30, backgroundColor: 'rgb(54,70,93)', width: 'inherit', position: 'absolute', bottom: 0 }} />
            </div>
        )
    }

}