import React from 'react';
import './Button.css';
//Imports
import {Selector} from '../Selector/Selector';
import {Search} from '../Search/Search';

//Component class
export class Button extends React.Component {
    render () {
        let button;
        //If the user has already shuffled then we display a 'Play' button for them to visit the selection on Spotify
        if(this.props.scrolling){
            button = (
                <a href={this.props.albumLink} target="_blank" rel="noreferrer"><button className="playButton" id="button" onClick={this.props.onPlay}>Play</button></a>
            );
        } else {
            button = (
                <div className="Button">
                    <Selector onChange={this.props.selectorOnChange} default={this.props.default}/>
                    <button className="shuffleButton" id="button" onClick={this.props.onShuffle}>Shuffle</button>
                    <Search type={this.props.default} onChange={this.props.onSearch}/>
                </div>
            );
        }
        //Otherwise we display the Selector, and the Shuffle button. Note that the Search bar here is purely for layout purposes as it will always be hidden.
        return button;
    }
}