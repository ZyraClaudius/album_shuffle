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