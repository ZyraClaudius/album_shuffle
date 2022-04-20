import './App.css';
import React from 'react';
import {Authenticator} from '../Authenticator/Authenticator';
import {Shuffle} from '../Shuffle/Shuffle';
import {Spotify} from '../../util/Spotify';

export class App extends React.Component {
  constructor(props) {
    super(props);
    let haveToken = Spotify.checkAccessToken();
    this.state = {authenticator : !haveToken, type:'albums'};
    this.selectorOnChange = this.selectorOnChange.bind(this);
  }

  render() {
    let jsx = <h1 key="1">Album Shuffle</h1>;
    if(this.state.authenticator){
      jsx = [
        jsx,
        <Authenticator key="Authenticator"/>
      ];
    } else {
      jsx = [
        jsx,
        <Shuffle key={this.state.type} type={this.state.type} selectorOnChange = {this.selectorOnChange} getAlbumScroll={Spotify.getAlbumScroll}/>
      ];
    }
    return (
      <div className="App">
        {jsx}
        <footer>
          <p>This app was developed by Zyra Alvarez Claudius using the Spotify api</p>
        </footer>
      </div>
    );
  }

  selectorOnChange(e) {
    Spotify.clearRemaining();
    console.log("changing");
    let value = e.target.value;
    console.log(value);
    this.setState({type:value});
  }
}
