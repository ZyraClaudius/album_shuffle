//This is a very simple component. It is simply a large input box. Autofocus is on since we need the search to continue even after the results have begun to load
import React from 'react';
import './Search.css';

export class Search extends React.Component {
    render() {
        let visibility = "visible";
        if(this.props.type !== "artists") {
            visibility = "hidden";
        }
        return(
            <input name="search" onChange={this.props.onChange} style={{visibility:visibility}} defaultValue={this.props.default} autoFocus></input>
        );
    }
}