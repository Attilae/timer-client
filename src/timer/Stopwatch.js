import React, {Component, PropTypes} from "react";

class Stopwatch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stopwatches: {}
        };
        this.formatCount = this.formatCount.bind(this);
    }

    formatCount(seconds) {
        /*
        // https://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds
        function addZero( number ) {
            if ( number < 10 ) number = "0" + number.toString()
            return number
        }
        const hours = addZero( Math.floor( seconds / ( 60 * 60 ) ) )
        const minutes = addZero( Math.floor( seconds / 60 ) )
        const formattedSeconds = addZero( seconds - ( minutes * 60 ) )
        const count = `${hours}:${minutes}:${formattedSeconds}`
        return count
        */

        function addZero(number) {
            if (number < 10) number = "0" + number.toString();

            return number;
        }

        const hours = addZero(Math.floor(seconds / (60 * 60)));

        var date = new Date(null);
        date.setSeconds(seconds);

        // retrieve time ignoring the browser timezone - returns hh:mm:ss
        var utc = date.toUTCString();
        // negative start index in substr does not work in IE 8 and earlier
        var time = utc.substr(utc.indexOf(":") - 2, 8);

        // retrieve each value individually - returns h:m:s
        var time = hours + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();

        // does not work in IE8 and below - returns hh:mm:ss
        var time = date.toISOString().substr(11, 8);

        return time;
    }

    initTimer(name) {
        if (this.state.stopwatches[name]) clearInterval(this.state.stopwatches[name].counter);

        const stopwatch = setInterval(_ => {
            this.setState({
                ...this.state,
                stopwatches: {
                    ...this.state.stopwatches,
                    [name]: {
                        ...this.state.stopwatches[name],
                        count: ++this.state.stopwatches[name].count
                    }
                }
            });
        }, 1000);

        this.setState({
            ...this.state,
            stopwatches: {
                ...this.state.stopwatches,
                [name]: {
                    counter: stopwatch,
                    count: 0
                }
            }
        });
    }

    componentWillMount() {
        console.log(this.props.stopwatches);
        for (let stopwatch of this.props.stopwatches) {
            this.initTimer(stopwatch);
        }
    }

    componentWillUnmount() {
        for (let stopwatch of this.props.stopwatches) {
            clearInterval(this.state.stopwatches[stopwatch].counter);
        }
    }

    render() {
        return (
            <div className="">
                {Object.keys(this.state.stopwatches).map(stopwatch => {
                    const name = stopwatch;
                    return (
                        <span>
                            <i className="icon ion-md-time mr-2"/>
                            {name}: <span
                            className="monospace">{this.formatCount(this.state.stopwatches[name].count)}</span>
                        </span>
                    );
                })}
            </div>
        );
    }
}

Stopwatch.propTypes = {};

export default Stopwatch;