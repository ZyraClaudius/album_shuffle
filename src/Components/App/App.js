//Imports
import './App.css';
import React from 'react';
import {Authenticator} from '../Authenticator/Authenticator';
import {Shuffle} from '../Shuffle/Shuffle';
import {Spotify} from '../../util/Spotify';

//Component class
export class App extends React.Component {
  constructor(props) {
    super(props);
    //Checks if a token is already obtained. If not then we show the authenticator
    let haveToken = Spotify.checkAccessToken();

    //The default state is to view albums
    this.state = {authenticator : !haveToken, type:'albums'};

    //The "selector" is the drop-down list with choices "My Albums", "My Playlists", and "Search Artists"
    this.selectorOnChange = this.selectorOnChange.bind(this);
  }

  //Render
  render() {
    //The header, which stays in place through all states
    let jsx = <h1 key="1">Album Shuffle</h1>;

    //If we need to obtain an access token then the authenticator is added to the list. Otherwise we display the shuffler.
    if(this.state.authenticator){
      jsx = [
        jsx,
        <Authenticator key="Authenticator"/>
      ];
    } else {
      jsx = [
        jsx,
        //The Shuffle component takes a key of the type ("albums", "playlists", or "artists") as changing the key forces the component to re-mount, which we need it to do as fetching the list of albums happens in "componentDidMount"
        <Shuffle key={this.state.type} type={this.state.type} selectorOnChange = {this.selectorOnChange} getAlbumScroll={Spotify.getAlbumScroll}/>
      ];
    }

    //We return the list - heading and authenticator/shuffler - and add a footer
    return (
      <div className="App">
        {jsx}
        <footer>
          <p>This app was developed by Zyra Alvarez Claudius using the Spotify api</p>
        </footer>
      </div>
    );
  }

  //If the user chooses a new way to shuffle from the dropdown then the list of remaining albums is cleared (otherwise the Spotify class will automatically return it) and the type state is changed.
  selectorOnChange(e) {
    Spotify.clearRemaining();
    //console.log("changing");
    let value = e.target.value;
    //console.log(value);
    this.setState({type:value});
  }
}
