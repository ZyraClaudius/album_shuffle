import React from 'react';
import './SearchResults.css';

export class SearchResults extends React.Component {
    render() {
        //If the results prop is undefined then there are no results to display. We display a prompt to the user to type something in the search bar.
        if(!this.props.results) {
            return(
                <div className="SearchResults">
                    <p>Type in the search bar to see results</p>
                </div>
            );
        }

        //If there are some results then we display the top 5 results
        let results = this.props.results;
        if(results.length>5) {
            results.slice(0,5);
        }

        //We map the results to a list of buttons displaying the relevant artist name. data-id is here to allow us to access the Spotify id of the selected artist, which we will need to do to find their albums
        results = results.map((artist,index) => <button key={index} data-id={artist.id} onClick={this.props.onSelect}>{artist.name}</button>)
        return(
            <div className="SearchResults">
                {results}
            </div>
        );
    }
}