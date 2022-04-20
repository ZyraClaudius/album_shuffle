import React from 'react';
import {Spotify} from '../../util/Spotify';
import './Authenticator.css';

export class Authenticator extends React.Component {
    render () {
        return (
            <div className="Authenticator">
                <div className='oneLine'>
                    <p>You need to authenticate with
                    <img src="./images/Spotify_Logo_RGB_Green.png" id="logo" alt="Spotify logo" />
                    to use this app.</p>
                </div>
                
                <button onClick={Spotify.getAccessToken}>Click Here</button>
                <p className='grey'>We do not store any data about your Spotify account, your library, or your usage of this app. We only require access to your Spotify account to access your saved albums. You can revoke this permission at any time by going to your Spotify account settings.</p>
            </div>
        );
    }
}