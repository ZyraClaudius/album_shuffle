//accessToken is a global variable which stores our access token
let accessToken;
//remainingAlbums is a global variable which stores our list of remainingAlbums.
//When the user clicks Play or Spin Again the resulting shuffle excludes the albums already chosen
let remainingAlbums;

//My clientID from Spotify and the redirectURI, which I store in a global variable to make it easy to change so I can run it on the development server and deploy it to surge.
const clientID = '2dc398de96b14c44b2ba54f13dcb1e6e';
const redirectURI = 'http://localhost:3000';

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
            //We kill the accessToken variable when the token expires
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return true;
            }
        return false;
    }

    //A variable which takes an array and returns a new array with the same elements in a random order. The original array is not mutated
    static shuffleArray(array) {
        let newArray = array.slice();
        let shuffledArray = [];
        while(newArray.length > 0) {
            let index = Math.floor(Math.random()*newArray.length);
            shuffledArray.push(newArray.splice(index,1)[0]);
        }
        return shuffledArray;
    }

    /*Gets and returns a list of a user's saved albums or playlists. The argument should be "albums" or "playlists"*/
    static async getAlbums(get) {
        //If we already have some remaining albums then we return this array. It may be empty if the last album in a category has just been chosen, but Shuffle.js accounts for this possibility
        if(remainingAlbums){
            //console.log(`Returning ${remainingAlbums.length} albums remaining`)
            //We return a copy of remainingAlbums as we do not want to mutate the original array
            return remainingAlbums.slice();
        }

        //We create an empty array to fill with albums/playlists and the url for our query to Spotify
        let allAlbums = [];
        let fetchURL = `https://api.spotify.com/v1/me/${get}?offset=0&limit=50`;
        while(fetchURL) {
            //While there is a url to send our request to we send a request. This allows us to get through every page of results, as Spotify returns pages of 50 at a time

            //First we .getAccessToken(). We do this for every iteration (as opposed to before the loop) to avoid the possibility that our token could expire while we are looping. It has happened before!
            let ourToken = this.getAccessToken();
            //Fetch the albums
            let albums = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
            //Convert to an object from a json string
            let jsonAlbums = await albums.json();
            //Extract the requested "items" from the response
            let albumList = jsonAlbums.items;
            //If shuffling albums we ONLY want to return ALBUMS or EPs (not singles) as the intention is to allow the user to listen to a full length body of work, not just a couple of songs.
            if(get==='albums') {
                albumList = albumList.filter(album => album.album.album_type==="album" || album.album.album_type==="ep");
            }
            //If shuffling playlists we want to only return playlists with an associated image (only empty playlists have no images)
            if(get==='playlists') {
                albumList = albumList.filter(playlist => playlist.images.length>0);
            }
            //We add the recent albums to our list
            allAlbums = allAlbums.concat(albumList);
            //We update our url with the next attribute of the response from Spotify (corresponding to the url for the next page of results). If we're on the last page then this will be null and the loop will end as null is falsy
            fetchURL = jsonAlbums.next;
        }
        //We shuffle the array
        allAlbums = Spotify.shuffleArray(allAlbums);
        //remainingAlbums is set to a COPY of all the albums. We do not want to mutate the original array by mistake!
        remainingAlbums = allAlbums.slice();
        return allAlbums;
    }

    /*Selects a random album and returns this and the 20 before (for the scroll animation)*/
    static async getAlbumScroll(get) {
        //We use getAlbums with an argument of "playlists" or "albums" to get a list of albums
        let allAlbums = await Spotify.getAlbums(get);

        //If there are no albums then we return an empty array
        if(allAlbums.length===0) {
            return [];
        }
        //console.log(allAlbums);
        //console.log(allAlbums.length);
        
        //Choose a random index and remove this from remainingAlbums (this is why we set remainingAlbums to be a copy)
        let index = Math.floor(Math.random()*allAlbums.length);
        //console.log(index);
        //console.log("Removing album")
        Spotify.removeAlbum(index);

        //We start from the one AFTER the chosen one as we want to give the illusion that the scroll is never-ending or wraps-around, so we want to display an album on the left once the selected album is placed center
        index++;
        //console.log(index);
        //console.log(allAlbums.length);
        
        //However, if there is no next one, then we wrap-around to start from the first one
        if(index===allAlbums.length){
            //console.log("looping")
            index = 0;
        }

        //console.log(randomIndex);
        
        //Initialize the variable which will hold our scroll of albums
        let albumScroll = [];

        //We get 20 albums
        for(let i=0; i<20; i++) {
            //If we've dropped below the first element then we wrap to the end
            while(index<0) {
                index=allAlbums.length+index;
            }

            //We use unshift as we want to fill in on the left. We want our chosen album to be the second-to-last, not the second.
            albumScroll.unshift(allAlbums[index]);
            index --;
        }
        return albumScroll;
    }

    //This simply removes the element at a given index from our remainingAlbums
    static removeAlbum(index) {
        remainingAlbums.splice(index,1);
        //console.log(remainingAlbums);
    }


    //This clears the remainingAlbums by setting it to undefined, which is falsy
    static clearRemaining() {
        remainingAlbums = undefined;
    }

    //This searches for artists based on a query string (as argument)
    static async searchArtists(q) {
        //We get the access token and set the fetch URL. We only need the top 5 results 
        let ourToken = this.getAccessToken();
        let fetchURL = `https://api.spotify.com/v1/search?q=${q}&type=artist&limit=5`
        let results = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
        results = await results.json();
        let artists = results.artists.items;
        return artists;
    }

    //This gets albums by an artist by the artists Spotify id (as argument)
    static async getArtistAlbums(id) {
        //We initialize our albums variable and, as always, if we already have some albumsRemaining, we just return these
        let albums;
        if(remainingAlbums) {
            albums = remainingAlbums;
        } else {
            //console.log(ourToken);
            //Otherwise we search for each page of results and add the items returned from our search (albums and singles) to the albums array
            albums = [];
            //We include singles here as we want it to be a way to discover ALL of an artist's music
            let fetchURL = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single`;
            while(fetchURL) {
                let ourToken = this.getAccessToken();
                let results = await fetch(fetchURL,{headers:{'Authorization':`Bearer ${ourToken}`}});
                results = await results.json();
                //console.log(results);
                fetchURL = results.next;
                albums = albums.concat(results.items);
                //console.log(fetchURL);
            }
            //console.log(albums);

            //Again we shuffle the albums and put a COPY in remainingAlbums (we do not wish to mutate the array by accident)
            albums = Spotify.shuffleArray(albums);
            remainingAlbums = albums.slice();
        }

        //From here on works pretty much the same as in getAlbumScroll()
        if(albums.length===0) {
            return [];
        }
        let index = Math.floor(Math.random()*albums.length);
        Spotify.removeAlbum(index);
        index++;
        //console.log(albums);
        if(index>=albums.length){
            //console.log("looping")
            index = 0;
        }
        //console.log(randomIndex);
        let albumScroll = [];
        for(let i=0; i<20; i++) {
            while(index<0) {
                index=albums.length+index;
                //console.log("loopyloo");
            }
            albumScroll.unshift(albums[index]);
            index --;
        }
        return albumScroll;
    }
}