import React from 'react';
import './Selector.css';

export class Selector extends React.Component {
    //This is the drop-down list. The "default" prop corresponds to the "type" of shuffler ("albums", "playlists", or "artists"); it allows us to display the currently chosen "type" as the defaultValue of the selector.
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