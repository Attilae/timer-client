import React, {Component} from 'react';
import './Timer.css';
import {Avatar, Icon} from 'antd';
import {Link} from 'react-router-dom';
import {getAvatarColor} from '../util/Colors';
import {formatDateTime} from '../util/Helpers';

import {Radio, Button} from 'antd';

const RadioGroup = Radio.Group;

class Timer extends Component {
    calculatePercentage = (choice) => {
        if (this.props.poll.totalVotes === 0) {
            return 0;
        }
        return (choice.voteCount * 100) / (this.props.poll.totalVotes);
    };

    isSelected = (choice) => {
        return this.props.poll.selectedChoice === choice.id;
    }

    getWinningChoice = () => {
        return this.props.poll.choices.reduce((prevChoice, currentChoice) =>
                currentChoice.voteCount > prevChoice.voteCount ? currentChoice : prevChoice,
            {voteCount: -Infinity}
        );
    }

    getTimeRemaining = (poll) => {
        const expirationTime = new Date(poll.expirationDateTime).getTime();
        const currentTime = new Date().getTime();

        var difference_ms = expirationTime - currentTime;
        var seconds = Math.floor((difference_ms / 1000) % 60);
        var minutes = Math.floor((difference_ms / 1000 / 60) % 60);
        var hours = Math.floor((difference_ms / (1000 * 60 * 60)) % 24);
        var days = Math.floor(difference_ms / (1000 * 60 * 60 * 24));

        let timeRemaining;

        if (days > 0) {
            timeRemaining = days + " days left";
        } else if (hours > 0) {
            timeRemaining = hours + " hours left";
        } else if (minutes > 0) {
            timeRemaining = minutes + " minutes left";
        } else if (seconds > 0) {
            timeRemaining = seconds + " seconds left";
        } else {
            timeRemaining = "less than a second left";
        }

        return timeRemaining;
    }

    getTimerTime = (startDateTime, endDateTime) => {
        var startTimeStamp = new Date(startDateTime).getTime();
        var endTimeStamp = new Date(endDateTime).getTime();
        var difference = endTimeStamp - startTimeStamp;

        return new Date(difference).getMinutes();
    }

    render() {
        const timerChoices = [];
        /*if(this.props.timer.selectedChoice || this.props.poll.expired) {
            const winningChoice = this.props.poll.expired ? this.getWinningChoice() : null;

            this.props.poll.choices.forEach(choice => {
                pollChoices.push(<CompletedOrVotedPollChoice 
                    key={choice.id} 
                    choice={choice}
                    isWinner={winningChoice && choice.id === winningChoice.id}
                    isSelected={this.isSelected(choice)}
                    percentVote={this.calculatePercentage(choice)} 
                />);
            });                
        } else {
            this.props.poll.choices.forEach(choice => {
                pollChoices.push(<Radio className="poll-choice-radio" key={choice.id} value={choice.id}>{choice.text}</Radio>)
            })    
        }     */
        return (
            <div className="timer-content">
                <div className="timer-header">
                    <div className="timer-creator-info">
                        <Link className="creator-link" to={`/users/${this.props.timer.createdBy.username}`}>
                            <Avatar className="timer-creator-avatar"
                                    style={{backgroundColor: getAvatarColor(this.props.timer.createdBy.name)}}>
                                {this.props.timer.createdBy.name[0].toUpperCase()}
                            </Avatar>
                            <span className="timer-creator-name">
                                {this.props.timer.createdBy.name}
                            </span>
                            <span className="timer-creation-date">
                                {this.getTimerTime( this.props.timer.startDateTime, this.props.timer.endDateTime )}
                            </span>
                            <span className="timer-creator-username">
                                @{this.props.timer.createdBy.username}
                            </span>
                            <span className="timer-creation-date">
                                {formatDateTime(this.props.timer.creationDateTime)}
                            </span>
                        </Link>
                    </div>
                    <div className="timer-question">
                        {this.props.timer.question}
                    </div>
                </div>

            </div>
        );
    }
}

function CompletedOrVotedPollChoice(props) {
    return (
        <div className="cv-poll-choice">
            <span className="cv-poll-choice-details">
                <span className="cv-choice-percentage">
                    {Math.round(props.percentVote * 100) / 100}%
                </span>            
                <span className="cv-choice-text">
                    {props.choice.text}
                </span>
                {
                    props.isSelected ? (
                        <Icon
                            className="selected-choice-icon"
                            type="check-circle-o"
                        />) : null
                }    
            </span>
            <span className={props.isWinner ? 'cv-choice-percent-chart winner' : 'cv-choice-percent-chart'}
                  style={{width: props.percentVote + '%'}}>
            </span>
        </div>
    );
}


export default Timer;