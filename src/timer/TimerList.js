import React, { Component } from 'react';
import { getAllTimers, getUserCreatedPolls, getUserVotedPolls } from '../util/APIUtils';
import Timer from './Timer';
import { castVote } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { TIMER_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './TimerList.css';

class TimerList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timers: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentVotes: [],
            isLoading: false
        };
        this.loadTimerList = this.loadTimerList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    loadTimerList(page = 0, size = TIMER_LIST_SIZE) {
        let promise;
        if(this.props.username) {
            /*if(this.props.type === 'USER_CREATED_TIMERS') {
                promise = getUserCreatedPolls(this.props.username, page, size);
            } else if (this.props.type === 'USER_VOTED_POLLS') {
                promise = getUserVotedPolls(this.props.username, page, size);                               
            }*/
            promise = getAllTimers(page, size);
        } else {
            promise = getAllTimers(page, size);
        }

        if(!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise            
        .then(response => {
            const timers = this.state.timers.slice();
            //const currentVotes = this.state.currentVotes.slice();

            this.setState({
                timers: timers.concat(response.content),
                page: response.page,
                size: response.size,
                totalElements: response.totalElements,
                totalPages: response.totalPages,
                last: response.last,
                //currentVotes: currentVotes.concat(Array(response.content.length).fill(null)),
                isLoading: false
            })
        }).catch(error => {
            this.setState({
                isLoading: false
            })
        });  
        
    }

    componentWillMount() {
        this.loadTimerList();
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                timers: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                //currentVotes: [],
                isLoading: false
            });    
            this.loadTimerList();
        }
    }

    handleLoadMore() {
        this.loadTimerList(this.state.page + 1);
    }

    handleVoteChange(event, pollIndex) {
        const currentVotes = this.state.currentVotes.slice();
        currentVotes[pollIndex] = event.target.value;

        this.setState({
            currentVotes: currentVotes
        });
    }


    handleVoteSubmit(event, pollIndex) {
        event.preventDefault();
        if(!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: 'Polling App',
                description: "Please login to vote.",          
            });
            return;
        }

        const poll = this.state.polls[pollIndex];
        const selectedChoice = this.state.currentVotes[pollIndex];

        const voteData = {
            pollId: poll.id,
            choiceId: selectedChoice
        };

        castVote(voteData)
        .then(response => {
            const polls = this.state.polls.slice();
            polls[pollIndex] = response;
            this.setState({
                polls: polls
            });        
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login to vote');    
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });                
            }
        });
    }

    render() {
        const timerViews = [];
        this.state.timers.forEach((timer, timerIndex) => {
            timerViews.push(<Timer
                key={timer.id}
                timer={timer}
                //currentVote={this.state.currentVotes[pollIndex]}
                handleVoteChange={(event) => this.handleVoteChange(event, timerIndex)}
                handleVoteSubmit={(event) => this.handleVoteSubmit(event, timerIndex)} />)
        });

        return (
            <div className="timers-container">
                {timerViews}
                {
                    !this.state.isLoading && this.state.timers.length === 0 ? (
                        <div className="no-timers-found">
                            <span>No Timers Found.</span>
                        </div>    
                    ): null
                }  
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-timers">
                            <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                <Icon type="plus" /> Load more
                            </Button>
                        </div>): null
                }              
                {
                    this.state.isLoading ? 
                    <LoadingIndicator />: null                     
                }
            </div>
        );
    }
}

export default withRouter(TimerList);