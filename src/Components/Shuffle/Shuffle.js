import React from 'react';
import './Shuffle.css';
import {Button} from '../Button/Button';
import {Spotify} from '../../util/Spotify';
import {Search} from '../Search/Search';
import {SearchResults} from '../SearchResults/SearchResults';
import {Selector} from '../Selector/Selector';

export class Shuffle extends React.Component {
    constructor(props) {
        console.log("constructing");
        super(props);
        this.state = {loaded:false,artistSelected:false};
        this.getAlbumScroll = this.getAlbumScroll.bind(this);
        this.onShuffle = this.onShuffle.bind(this);
        this.onPlay = this.onPlay.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onSelect = this.onSelect.bind(this);
    }

    async componentDidMount() {
        let type = this.props.type;
        console.log("Mounted!");
        if(type==="albums"||type==='playlists'){
            Spotify.clearRemaining();
            let albumScroll = await this.getAlbumScroll();
            this.setState({loaded:true, albums:albumScroll});
            if(type==='albums'){
                this.setState({albumLink:this.state.albums[18].album.external_urls.spotify});
            } else if(type==='playlists'){
                this.setState({albumLink:this.state.albums[18].external_urls.spotify})
            }
        }
    }

    render() {
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

        if(!this.state.loaded) {
            console.log("loading");
            let loading = [<p key="1" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>,<p key="2" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>,<p key="3" style={{backgroundColor:'rgb(0,0,255)'}}>Loading...</p>];
            return (
                <div className = "Shuffle">
                    <div id="albumScroll">
                        <div id="cover1"></div>
                        {loading}
                        <div id="cover2"></div>
                    </div>
                </div>
            );
        }

        if(this.state.loaded) {
            let albumImages;
            if(this.state.albums.length===0) {
                console.log("here");
                return (
                    <div className="Shuffle">
                        <p id="noAlbums">No albums found. Either there are no albums in the selected category, or you've shuffled through them all.</p>
                        <Button default={this.props.type} selectorOnChange={this.props.selectorOnChange} id="button" scrolling={false} onShuffle={this.onShuffle} onSearch={this.onSearch}/>
                    </div>
                );
            } else {
                if(this.props.type==='albums') {
                    //console.log(this.state.albums);
                    albumImages = this.state.albums.map((album,index) => <img style={{gridColumn:index+1, gridRow:1}} key={index} alt="album cover" src={album.album.images[0].url} />);
                } else if(this.props.type==='playlists'||this.props.type==='artists') {
                    console.log("Playlists: ")
                    console.log(this.state.albums);
                    albumImages = this.state.albums.map((playlist,index) => <img style={{gridColumn:index+1, gridRow:1}} key={index} alt="album cover" src={playlist.images[0].url} />);
                }
            }
            
            let albumScroll;
            let button;
            let again;
            if(this.state.scrolling) {
                albumScroll = (
                    <div id="albumScroll" className="scrolling">
                        <div id="cover1" className="scrollingCover"></div>
                        {albumImages}
                        <div id="cover2" className="scrollingCover"></div>
                    </div>
                );
                button = <Button scrolling={true} albumLink={this.state.albumLink} onPlay={this.onPlay}/>;
                again = <a onClick={this.onPlay}>Spin again</a>
            } else {
                albumScroll = (
                    <div id="albumScroll">
                        <div id="cover1"></div>
                        {albumImages}
                        <div id="cover2"></div>
                    </div>
                );
                button = <Button default={this.props.type} selectorOnChange={this.props.selectorOnChange} id="button" scrolling={false} onShuffle={this.onShuffle} onSearch={this.onSearch}/>
            }
            return (
                <div className = "Shuffle">
                    {albumScroll}
                    <div id="buttondiv">{button}</div>
                    {again}
                </div>
            );
        } 
    }

    async componentDidUpdate(prevProps) {
        if(this.props.type !== prevProps.type) {
            Spotify.clearRemaining();
            this.setState({loaded:false});
            let albumScroll = await this.getAlbumScroll();
            console.log("Updating: ")
            console.log(albumScroll);
            this.setState({loaded:true, albums:albumScroll});
            this.setState({albumLink:this.state.albums[18].album.external_urls.spotify});
        }
        return true;
    }

    async getAlbumScroll() {
        console.log(this.props.type);
        let albumScroll = await this.props.getAlbumScroll(this.props.type);
        console.log(albumScroll);
        return albumScroll;
    }

    onShuffle() {
        this.setState({scrolling: true});
    }

    async onPlay() {
        console.log("playing");
        let newScroll = await this.props.getAlbumScroll();
        if(newScroll.length===0) {
            this.setState({albums:newScroll});
            return;
        }
        let newAlbum
        if(this.props.type==='albums'){
            newAlbum = newScroll[18].album.external_urls.spotify;
        } else if(this.props.type==='playlists'||this.props.type==='artists'){
            newAlbum = newScroll[18].external_urls.spotify;
        }
        this.setState({albums: newScroll,scrolling:false,albumLink:newAlbum});
    }

    async onSearch(e) {
        Spotify.clearRemaining();
        let currentSearch = e.target.value;
        this.setState({artistSelected:false,currentSearch:currentSearch});
        if(e.target.value) {
            let artists = await Spotify.searchArtists(e.target.value);
            this.setState({artists:artists});
        }
        else {
            this.setState({artists:0});
        }
    }

    async onSelect(e) {
        this.setState({loaded:false,artistSelected:true});
        let id = e.target.getAttribute("data-id");
        let albums = await Spotify.getArtistAlbums(id);
        console.log(albums);
        if(albums.length===0) {
            this.setState({albums:albums,artistSelected:true,loaded:true});
            return;
        }
        let albumLink = albums[18].external_urls.spotify;
        this.setState({loaded:true,albums:albums,artistSelected:true,albumLink:albumLink});
    }
}