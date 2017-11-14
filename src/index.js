import 'babel-polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {Router,Route,hashHistory} from 'react-router'
import AllComponent from "./components/AllComment"
import CommentList from "./components/CommentList"
import FastClick from 'fastclick'
import './index.css';

ReactDOM.render((<Router history={hashHistory}>
    <Route path="/" component={App}>
        <Route path="/detail/:id" component={AllComponent}>
        </Route>
        <Route path="/commentList/:subjectId/:nextPageFromTime" component={CommentList}/>
    </Route>
</Router>), document.getElementById('root'));
window.addEventListener('load', () => {
    FastClick.attach(document.body);
});

