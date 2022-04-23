import React from 'react';
import './Shuffle.css';
import {Button} from '../Button/Button';
import {Spotify} from '../../util/Spotify';
import {Search} from '../Search/Search';
import {SearchResults} from '../SearchResults/SearchResults';
import {Selector} from '../Selector/Selector';

export class Shuffle extends React.Component {
    //This is by far the most complicated component.
    constructor(props) {
        //console.log("constructing");
        super(props);
        //By default "loaded" is false to display the loading screen. artistSelected is only needed when the type is "artists," and indicates whether or not the user has chosen an artist or is still at the searching stage.
        this.state = {loaded:false,artistSelected:false};

        //Below we just bind event handlers to the instance.
        this.getAlbumScroll = this.getAlbumScroll.bind(this);
        this.onShuffle = this.onShuffle.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    //This takes care of loading the first set of albums.
    async componentDidMount() {
        let type = this.props.type;
        //console.log("Mounted!");
        //If "type" is "albums" or "playlists" then we proceed
        if(type==="albums"||type==='playlists'){
            //We get the album scroll - the twenty albums to display in our sliding grid.
            //First we must clear the list of remaining albums or the Spotify class will return this.
            Spotify.clearRemaining();
            let albumScroll = await this.getAlbumScroll();
            //The response from Spotify is in a slightly different format for albums and playlists, so we must find the link to the album on Spotify slightly differently. In each case, loaded is set to true and the array of albums is set to our new array once the albums are found.
            if(type==='albums'){
                this.setState({albumLink:albumScroll[18].album.external_urls.spotify, loaded:true, albums:albumScroll});
            } else if(type==='playlists'){
                this.setState({albumLink:albumScroll[18].external_urls.spotify, loaded:true, albums:albumScroll});
            }
        }
    }


    //A very big render method
    render() {

        //The first case is if we are shuffling artists but the user has NOT chosen an artist yet. In this case we must display the search results (or a message prompting the user to enter a search term), and the search bar. We also display the selector should the user wish to change their mind at this stage. 
        if(this.props.type==="artists" && !this.state.artistSelected) {
            //console.log("searching");
            return (
                <div className="Searching">
                    <SearchResults results = {this.state.artists} onSelect={this.onSelect}/>
                    <div>
                        <Selector onChange={this.props.selectorOnChange} default='artists'/>
                        <Search type="artists" onChange={this.onSearch} default={this.state.currentSearch}/>
                    </div>
                </div>
            );
        }

        //If we have not yet loaded results then we display a "loading..." message and the selector in case they want to change their mind. We also include the search bar, which will hide itslef unless "type" is "artists"
        if(!this.state.loaded) {
            //console.log("loading");
            let loading = [<p key="1" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>,<p key="2" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>,<p key="3" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>];
            return (
                <div className = "Shuffle">
                    <div id="albumScroll">
                        <div id="cover1"></div>
                        {loading}
                        <div id="cover2"></div>
                    </div>
                    <div>
                        <Selector onChange={this.props.selectorOnChange} default={this.props.type}/>
                        <Search type={this.props.type} onChange={this.onSearch} default={this.state.currentSearch}/>
                    </div>
                </div>
            );
        }

        //If we HAVE loaded the albums/playlists then we handle displaying them:
        if(this.state.loaded) {
            //Initialize the albumImages variable, which will eventually (hopefully) be an array of 20 JSX image elements for our 20 album/playlist covers
            let albumImages;
            
            //If we have an empty albums array then we display a message prompting the user to change categories or enter a new search term.
            if(this.state.albums.length===0) {
                //console.log("here");
                return (
                    <div className="Shuffle">
                        <p id="noAlbums">No albums found. Either there are no albums in the selected category, or you've shuffled through them all.</p>
                        <Button default={this.props.type} selectorOnChange={this.props.selectorOnChange} id="button" scrolling={false} onShuffle={this.onShuffle} onSearch={this.onSearch}/>
                    </div>
                );
            } else {
                //Otherwise we proceed
                if(this.props.type==='albums') {
                    //console.log(this.state.albums);
                    //If we have some albums to display then we create the array of JSX elements. The images need to be accessed slightly differently depending on the "type" due to the kind of object returned. They are positioned in a horizontal grid.
                    albumImages = this.state.albums.map((album,index) => <img style={{gridColumn:index+1, gridRow:1}} key={index} alt="album cover" src={album.album.images[0].url} />);
                } else if(this.props.type==='playlists'||this.props.type==='artists') {
                    //console.log("Playlists: ")
                    //console.log(this.state.albums);
                    albumImages = this.state.albums.map((playlist,index) => <img style={{gridColumn:index+1, gridRow:1}} key={index} alt="album cover" src={playlist.images[0].url} />);
                }
            }
            
            let albumScroll;
            let button;
            let again;
            //If the user has clicked shuffle then we display the covers scrolling (by setting className="scrolling") and the button is a Play button with the option to spin again instead
            if(this.state.scrolling) {
                albumScroll = (
                    <div id="albumScroll" className="scrolling">
                        <div id="cover1" className="scrollingCover"></div>
                        {albumImages}
                        <div id="cover2" className="scrollingCover"></div>
                    </div>
                );
                button = <Button scrolling={true} albumLink={this.state.albumLink} onPlay={this.onPlay}/>;
                again = <div id="againContainer"><button id="again" onClick={this.onPlay}>Spin again</button></div>
            } else {
                //Otherwise the album covers are static and the button is a Shuffle button and a drop-down selector,  with a search bar if we are in "artists" type.
                albumScroll = (
                    <div id="albumScroll">
                        <div id="cover1"></div>
                        {albumImages}
                        <div id="cover2"></div>
                    </div>
                );
                button = <Button default={this.props.type} selectorOnChange={this.props.selectorOnChange} id="button" scrolling={false} onShuffle={this.onShuffle} onSearch={this.onSearch}/>
            }

            //This is the return statement, where "again" may be empty and if so will simply not appear (React is nice like that).
            return (
                <div className = "Shuffle">
                    {albumScroll}
                    <div id="buttondiv">{button}</div>
                    {again}
                </div>
            );
        } 
    }

    async getAlbumScroll() {
        //This function is gets the 20 albums to display (in the case of "albums" or "playlists") by calling on the Spotify class
        //console.log(this.props.type);
        let albumScroll = await this.props.getAlbumScroll(this.props.type);
        //console.log(albumScroll);
        return albumScroll;
    }

    //When the user clicks the Shuffle button, scrolling is set to true to indicate this
    onShuffle() {
        this.setState({scrolling: true});
    }

    //When the user clicks Play then the chosen media will open in the Spotify app, if on mobile and they have it installed, and otherwise in the browser. However, we want some stuff to happen on our site in the background:
    async onPlay() {
        //console.log("playing");
        //We get a new set of 20 albums from the current category (either the users liked albums, playlists, or albums by a chosen artist)
        let newScroll = await this.props.getAlbumScroll();
        //If the new scroll is of length zero then this means the user just played the only album left in the category, so we set our "albums" state to an empty array to display a relevant message (see line 86)
        if(newScroll.length===0) {
            this.setState({albums:newScroll,scrolling:false});
            return;
        }
        //Otherwise we can assume the list is of length 20 so we selet the second-to-last one as the "chosen" album and set the albums state to our new 20, the albumLink state to the link to our new album on Spotify, and the scrolling state to false so the user may shuffle again
        let newAlbum
        if(this.props.type==='albums'){
            newAlbum = newScroll[18].album.external_urls.spotify;
        } else if(this.props.type==='playlists'||this.props.type==='artists'){
            newAlbum = newScroll[18].external_urls.spotify;
        }
        this.setState({albums: newScroll,scrolling:false,albumLink:newAlbum});
    }

    //This runs when the term in the search bar changes.
    async onSearch(e) {
        //First we clear the list of remaining albums. We are leaving that category. Even if the user searches the same artist they were just on, their whole catalogue will be loaded in.
        Spotify.clearRemaining();
        let currentSearch = e.target.value;
        //We set the artistSelected state to "false" as if the user begins to type a search then we want to switch to displaying search terms. The currentSearch state is used to set the default value of the "new" search bar which will be loaded when we switch to the state displaying search results. We want the entry in the search bar to match what has already been typed in
        this.setState({artistSelected:false,currentSearch:currentSearch});

        //If there is a term in the search bar then we get the results and set our "artists" state to said results.
        if(e.target.value) {
            let artists = await Spotify.searchArtists(e.target.value);
            this.setState({artists:artists});
        }
        else {
            //Otherwise we set "artists" to zero to display the prompt to enter something in the search bar. This accounts for the case where a user has typed in the search bar but backspaces to leave it blank.
            this.setState({artists:0});
        }
    }

    //This is called when the user picks an artist from the search results
    async onSelect(e) {
        //Loaded is set to false but artistSelected to true, which will prompt the loading screen to display
        this.setState({loaded:false,artistSelected:true});

        //The Spotify id of our artist is attached to the button through the "data-id" attribute
        let id = e.target.getAttribute("data-id");

        //We call getArtistAlbums from the Spotify class using the id as an argument
        let albums = await Spotify.getArtistAlbums(id);
        //console.log(albums);
        //If our albums array is empty then we pass it to the "albums" state (to display the message: see line 86). 
        if(albums.length===0) {
            this.setState({albums:albums,artistSelected:true,loaded:true});
            return;
        }

        //Otherwise it is safe to access the 19th element in the array, which will be the result of the shuffle. We set the link to this album as the albumLink state.
        let albumLink = albums[18].external_urls.spotify;
        this.setState({loaded:true,albums:albums,artistSelected:true,albumLink:albumLink});
    }
}