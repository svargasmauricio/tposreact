import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './src/store'; 
import Main from './src/index'

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Main />
            </Provider>
        );
    }
}