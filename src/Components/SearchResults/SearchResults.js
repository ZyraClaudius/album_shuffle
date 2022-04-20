import React from 'react';
import './SearchResults.css';

export class SearchResults extends React.Component {
    render() {
        if(!this.props.results) {
            return(
                <div className="SearchResults">
                    <p>Type in the search bar to see results</p>
                </div>
            );
        }
        let results = this.props.results;
        if(results.length>5) {
            results.slice(0,5);
        }
        results = results.map((artist,index) => <button key={index} data-id={artist.id} onClick={this.props.onSelect}>{artist.name}</button>)
        return(
            <div className="SearchResults">
                {results}
            </div>
        );
    }
}