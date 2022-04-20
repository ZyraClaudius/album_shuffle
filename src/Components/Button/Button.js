import React from 'react';
import './Button.css';
import {Selector} from '../Selector/Selector';
import {Search} from '../Search/Search';

export class Button extends React.Component {
    render () {
        let button;
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
        return button;
    }
}