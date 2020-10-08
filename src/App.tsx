import * as React from "react";
import { fetchLikes, Post } from "./posts";
import {
  List,
  WindowScroller,
  InfiniteLoader,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import { photoPost } from "./postRenderers";
import { navBar } from "./navBar";

import { styles } from "./styles";

const TUMBLR_BIG_BANG = 788918400;

const BLOG = "gerardogaol";

export interface AppState {
  blog: string;
  atIndex: number | undefined;
  atDate: number;
  width: number;
}

export class App extends React.Component<{}, AppState> {
  state = {
    blog: BLOG,
    atIndex: undefined,
    atDate: TUMBLR_BIG_BANG,
    width: window.innerWidth / 2,
  };

  _heightCache = new CellMeasurerCache({ fixedWidth: true, minHeight: 50 });
  posts = [] as Array<Post>;
  list: List | null = null;

  public componentDidMount() {
    this.loadLikes();

    const isPortrait = window.innerHeight > window.innerWidth;
    this.setState({
      width: isPortrait ? window.innerWidth : window.innerWidth / 3,
    });
  }

  public render = () => (
    <div style={styles.body}>
      {navBar(this.posts.length, () => {
        if (this.list) {
          this.list.scrollToPosition(100);
          console.log("scrolled?");
        }
      })}
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
                style={{ top: 20 }}
                height={height}
                isScrolling={isScrolling}
                onScroll={onChildScroll}
                scrollTop={scrollTop}
                onRowsRendered={onRowsRendered}
                width={this.state.width}
                ref={(list) => {
                  this.list = list;
                  return registerChild;
                }}
                rowCount={this.posts.length}
                rowHeight={this._heightCache.rowHeight}
                rowRenderer={(confObj) => this.rowRenderer(confObj)}
              />
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>
    </div>
  );

  private async loadLikes() {
    const { blog, atDate } = this.state;
    const fetchResult = await fetchLikes(blog, atDate);

    const {
      response: { _links: links, liked_posts: new_likes },
    } = { ...fetchResult };
    const nextDate = links.prev.query_params.after;

    console.log(new_likes.reverse());

    Array.prototype.push.apply(this.posts, new_likes.reverse());
    this.setState({
      atDate: nextDate,
    });
  }

  private async loadMoreRows({ startIndex }) {
    if (startIndex > this.posts.length) {
      await this.loadLikes();
    }
  }

  private isRowLoaded({ index }) {
    return index <= this.posts.length;
  }

  private rowRenderer({ key, index, parent, style }) {
    const post = this.posts[index];
    return (
      <CellMeasurer
        cache={this._heightCache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => photoPost(measure, style, index, post)}
      </CellMeasurer>
    );
  }
}
