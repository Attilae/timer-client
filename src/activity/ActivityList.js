import React, { Component } from 'react';
import { getAllActivities, getUserCreatedActivities, getUserVotedPolls } from '../util/APIUtils';
import Activity from './Activity';
import { castVote } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import { ACTIVITY_LIST_SIZE } from '../constants';
import { withRouter } from 'react-router-dom';
import './ActivityList.css';

class ActivityList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentVotes: [],
            isLoading: false
        };
        this.loadActivityList = this.loadActivityList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    loadActivityList(page = 0, size = ACTIVITY_LIST_SIZE) {
        let promise;
        if(this.props.username) {
            /*if(this.props.type === 'USER_CREATED_POLLS') {
                promise = getUserCreatedPolls(this.props.username, page, size);
            } else if (this.props.type === 'USER_VOTED_POLLS') {
                promise = getUserVotedPolls(this.props.username, page, size);                               
            }*/
            promise = getAllActivities(page, size);
        } else {
            promise = getAllActivities(page, size);
        }

        if(!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise            
        .then(response => {
            const activities = this.state.activities.slice();
            //const currentVotes = this.state.currentVotes.slice();

            this.setState({
                activities: activities.concat(response.content),
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
        this.loadActivityList();
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                activities: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                //currentVotes: [],
                isLoading: false
            });    
            this.loadActivityList();
        }
    }

    handleLoadMore() {
        this.loadActivityList(this.state.page + 1);
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
        const activityViews = [];
        this.state.activities.forEach((activity, activityIndex) => {
            activityViews.push(<Activity
                key={activity.id}
                activity={activity}
                //currentVote={this.state.currentVotes[pollIndex]}
                handleVoteChange={(event) => this.handleVoteChange(event, activityIndex)}
                handleVoteSubmit={(event) => this.handleVoteSubmit(event, activityIndex)} />)
        });

        return (
            <div className="activities-container">
                {activityViews}
                {
                    !this.state.isLoading && this.state.activities.length === 0 ? (
                        <div className="no-activities-found">
                            <span>No Activities Found.</span>
                        </div>    
                    ): null
                }  
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-activities">
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

export default withRouter(ActivityList);