import React from 'react';
import './Selector.css';

export class Selector extends React.Component {
    render() {
        return (
            <select onChange={this.props.onChange} id= "toShuffle" name="toShuffle" defaultValue={this.props.default}>
                    <option value="albums">My Albums</option>
                    <option value="playlists">My Playlists</option>
                    <option value="artists">Artist Search</option>
                </select>
        );
    }
}