import * as React from 'react';
// import { getLikes } from './posts';
// import * as ReactDOM from 'react-dom';

export interface AppState {
    posts: Array<any>;
    after: number;
}

export class App extends React.Component<{}, AppState> {
    state = {
        posts: [],
        after: 788918400,
    };

    public render = () => <div>
        <p>Saludos</p>
    </div>;

}