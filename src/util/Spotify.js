let accessToken;
let remainingAlbums;
const clientID = '2dc398de96b14c44b2ba54f13dcb1e6e';
const redirectURI = 'http://albumshuffle.surge.sh';

export class Spotify {

    /* Checks for an access token and refers user to the Spotify verification portal if none is available (in the accessToken variable or the current URL). If an access token is available then the token is returned*/
    static getAccessToken() {
        let haveToken = Spotify.checkAccessToken();
        if(haveToken) {
            return accessToken;
        } else {
            let scope = 'user-library-read playlist-read-collaborative playlist-read-private';
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=${scope}&redirect_uri=${redirectURI}`;
        }
    }

    /*Checks the current URL and accessToken variable. If an access token is available in the variable then returns true. If an access token is available in the URL then the variable is updated and true returned. Otherwise returns false*/
    static checkAccessToken() {
        if(accessToken) {
            //console.log("already have a token. returning");
            return true;
        } 
        //console.log('no token yet. attempting fetch...');
        let url = window.location.href;
        let newAccessToken = url.match(/access_token=([^&]*)/);
        let expiresIn = url.match(/expires_in=([^&]*)/);
        if(newAccessToken && expiresIn) {
            newAccessToken = newAccessToken[1];
            expiresIn = expiresIn[1]
            //console.log('token found. returning...');
            accessToken = newAccessToken;
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return true;
            }
        return false;
    }

    static shuffleArray(array) {
        let newArray = array.slice();
        let shuffledArray = [];
        while(newArray.length > 0) {
            let index = Math.floor(Math.random()*newArray.length);
            shuffledArray.push(newArray.splice(index,1)[0]);
        }
        return shuffledArray;
    }

    /*Gets and returns a list of a user's saved albums*/
    static async getAlbums(get) {
        if(remainingAlbums){
            console.log(`Returning ${remainingAlbums.length} albums remaining`)
            return remainingAlbums.slice();
        }
        let ourToken = this.getAccessToken();
        let allAlbums = [];
        let fetchURL = `https://api.spotify.com/v1/me/${get}?offset=0&limit=50`;
        while(fetchURL) {
            let albums = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
            let jsonAlbums = await albums.json();
            let albumList = jsonAlbums.items;
            if(get==='albums') {
                albumList = albumList.filter(album => album.album.album_type==="album");
            }
            if(get==='playlists') {
                albumList = albumList.filter(playlist => playlist.images.length>0);
            }
            allAlbums = allAlbums.concat(albumList);
            fetchURL = jsonAlbums.next;
        }
        allAlbums = Spotify.shuffleArray(allAlbums);
        remainingAlbums = allAlbums.slice();
        return allAlbums;
    }

    /*Selects a random album and returns this and the 20 before (for the scroll animation)*/
    static async getAlbumScroll(get) {
        let allAlbums = await Spotify.getAlbums(get);
        if(allAlbums.length===0) {
            return [];
        }
        //console.log(allAlbums);
        //console.log(allAlbums.length);
        let index = Math.floor(Math.random()*allAlbums.length);
        console.log(index);
        console.log("Removing album")
        Spotify.removeAlbum(index);
        index++;
        console.log(index);
        console.log(allAlbums.length);
        if(index===allAlbums.length){
            console.log("looping")
            index = 0;
        }
        //console.log(randomIndex);
        let albumScroll = [];
        for(let i=0; i<20; i++) {
            while(index<0) {
                index=allAlbums.length+index;
            }
            albumScroll.unshift(allAlbums[index]);
            index --;
        }
        return albumScroll;
    }

    static removeAlbum(index) {
        remainingAlbums.splice(index,1);
        console.log(remainingAlbums);
    }

    static clearRemaining() {
        remainingAlbums = undefined;
    }

    static async searchArtists(q) {
        let ourToken = this.getAccessToken();
        let fetchURL = `https://api.spotify.com/v1/search?q=${q}&type=artist&limit=5`
        let results = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
        results = await results.json();
        let artists = results.artists.items;
        return artists;
    }

    static async getArtistAlbums(id) {
        let albums;
        if(remainingAlbums) {
            albums = remainingAlbums;
        } else {
            let ourToken = this.getAccessToken();
            //console.log(ourToken);
            albums = [];
            let fetchURL = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single`;
            while(fetchURL) {
                let results = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
                results = await results.json();
                console.log(results);
                fetchURL = results.next;
                results = results.items.flat();
                albums = albums.concat(results);
                console.log(fetchURL);
            }
            console.log(albums);
            albums = Spotify.shuffleArray(albums);
            remainingAlbums = albums.slice();
        }
        if(albums.length===0) {
            return [];
        }
        let index = Math.floor(Math.random()*albums.length);
        Spotify.removeAlbum(index);
        index++;
        console.log(albums);
        if(index>=albums.length){
            console.log("looping")
            index = 0;
        }
        //console.log(randomIndex);
        let albumScroll = [];
        for(let i=0; i<20; i++) {
            while(index<0) {
                index=albums.length+index;
                console.log("loopyloo");
            }
            albumScroll.unshift(albums[index]);
            index --;
        }
        return albumScroll;
    }
}