import * as React from 'react';
import { likes, Post, Photo } from './posts';
import { List, WindowScroller, InfiniteLoader } from 'react-virtualized';
export interface AppState {
    blog: string;
    blogForm: string;
    posts: Array<Post>;
    after: number;
    fontSize: number;
    lineHeight: number;
    width: number;
}

export class App extends React.Component<{}, AppState> {
    state = {
        blog: 'gerrygoo',
        blogForm: '',
        posts: [] as Array<Post>,
        after: 788918400, // beginning of tumblr time
        fontSize: 14,
        lineHeight: 20,
        width: window.innerWidth / 2
    };

    public componentDidMount() {
        this.loadLikes();

        document.title = 'Oldest to Newest';

        const el = document.getElementById('root');
        const style = window.getComputedStyle(el!, null).getPropertyValue('font-size');
        const lineHeightStyle = window.getComputedStyle(el!, null).getPropertyValue('line-height');
        const fontSize = parseFloat(style);
        const lineHeight = parseFloat(lineHeightStyle)

        const portrait = window.innerHeight > window.innerWidth;

        this.setState({ fontSize, lineHeight, width: portrait ? window.innerWidth : window.innerWidth / 3 });
    }

    public render = () => <div style={{ backgroundColor: 'rgb(54,70,93)', display: 'flex', justifyContent: 'center' }}>
        <div style={{
            position: 'fixed',
             top: 0,
             height: 20,
             width: '100%',
             backgroundColor: 'SteelBlue',
             zIndex: 1,
             flexDirection: 'row',
             display: 'flex'
            }}
        >
            Reverse tumblr likes browser
            <button
                style={{
                    position: 'absolute',
                    right: 200,
                    height: 'inherit',
                }}
                title='Change!'
                onClick={ () => this.setState( (prevState) => ({ blog: prevState.blogForm }) ) }
            />
            <input
                style={{
                    position: 'absolute',
                    right: 0,
                    height: 'inherit',
                }}
                placeholder={this.state.blog}
                onChange={(event) => this.setState({blogForm: event.target.value})}
            />

        </div>
        <InfiniteLoader
            isRowLoaded={(idx) => this.isRowLoaded(idx)}
            loadMoreRows={(idx) => this.loadMoreRows(idx)}
            rowCount={30000}
        >
            {({ onRowsRendered, registerChild }) => (
                <WindowScroller>
                    {({ height, isScrolling, onChildScroll, scrollTop }) => (
                        <List
                            autoHeight
                            style={{top: 20}}
                            height={height}
                            isScrolling={isScrolling}
                            onScroll={onChildScroll}
                            scrollTop={scrollTop}

                            onRowsRendered={onRowsRendered}

                            // width={ window.innerWidth }
                            width={ this.state.width }

                            ref={registerChild}
                            rowCount={this.state.posts.length}
                            rowHeight={(idx) => this.rowHeight(idx)}
                            rowRenderer={(confObj) => this.rowRenderer(confObj)}
                        />
                    )}
                </WindowScroller>
            )}
        </InfiniteLoader>

    </div>;

    private async loadLikes() {
        const { blog, after } = this.state;
        const res = await likes(blog, after);

        const { response: { _links: links, liked_posts: new_likes } } = { ...res };

        const { prev: { query_params: { after: nextAfter } } } = links;
        // console.log(new_likes);

        this.setState({
            posts: this.state.posts.concat(new_likes.reverse()),
            after: nextAfter,
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
            ((text.length * fontSize ) / (this.state.width) ) +
            (text.match(/<\/p>\n<p>/gi) ? text.match(/<\/p>\n<p>/gi)!.length : 0) * 2
        );

        // console.log(lines, lineHeight, lines*lineHeight, fontSize);
        return lines * lineHeight;
    }

    private photosHeight( photos: Array<Photo> ) {
        const containerWidth = this.state.width;
        return photos.map(
            photo => (photo.original_size.height * ( photo.original_size.width < containerWidth ? 1 : (containerWidth / photo.original_size.width) ))
        ).reduce((acc, cur) => acc + cur);
    }

    private rowHeight({ index }): number {
        const post: Post = this.state.posts[index];

        const photosHeight = post.photos ? this.photosHeight(post.photos) : 0;
        const bodyHeight = post.body ? this.textHeight(post.body) : 0;
        const textHeight = post.text ? this.textHeight(post.text) : 0;

        return photosHeight + bodyHeight + (textHeight - 50) + 70;
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

        // if ( post.type == 'quote' ) console.log(post);

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
                <div style={{ alignSelf: 'flex-start' }} >{`${index}, on ${date.toLocaleString()}. Type: ${post.type}`}</div>
                <a
                    style={{ alignSelf: 'flex-start' }}
                    href={post.post_url}
                    target='_blank'
                >{post.post_url}</a>
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