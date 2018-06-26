import React, {Component} from 'react';
import {createTimer, activitiesByUser} from '../util/APIUtils';
import {MAX_CHOICES, POLL_CHOICE_MAX_LENGTH} from '../constants';
import './NewTimer.css';
import {Form, Input, Button, Icon, Select, notification} from 'antd';

const Option = Select.Option;
const FormItem = Form.Item;
const {TextArea} = Input;


class NewTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [{
                text: ''
            }, {
                text: ''
            }],
            activities: [],
            activity: {
                text: ''
            },
        };
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
        this.handleActivityChange = this.handleActivityChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }

    addTag(event) {
        const tags = this.state.tags.slice();
        this.setState({
            tags: tags.concat([{
                text: ''
            }])
        });
    }

    removeTag(tagNumber) {
        const tags = this.state.tags.slice();
        this.setState({
            tags: [...tags.slice(0, tagNumber), ...tags.slice(tagNumber + 1)]
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const timerData = {
            tags: this.state.tags.map(tag => {
                return {text: tag.text}
            }),
            activityId: this.state.activity.text,
            startDateTime: new Date(),
            endDateTime: new Date()
        };

        createTimer(timerData)
            .then(response => {
                this.props.history.push("/");
            }).catch(error => {
            if (error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login create poll.');
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            }
        });
    }

    validateTag = (tagText) => {
        if (tagText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter a choice!'
            }
        } else if (tagText.length > POLL_CHOICE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Choice is too long (Maximum ${POLL_CHOICE_MAX_LENGTH} characters allowed)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleTagChange(event, index) {
        const tags = this.state.tags.slice();
        const value = event.target.value;

        tags[index] = {
            text: value,
            ...this.validateTag(value)
        }

        this.setState({
            tags: tags
        });
    }

    isFormInvalid() {
        if (this.state.activity.validateStatus !== 'success') {
            return true;
        }

        for (let i = 0; i < this.state.tags.length; i++) {
            const tag = this.state.tags[i];
            if (tag.validateStatus !== 'success') {
                return true;
            }
        }
    }

    validateActivity = (activity) => {
        if (activity.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your question!'
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleActivityChange(value) {
        this.setState({
            activity: {
                text: value,
                ...this.validateActivity(value)
            }
        });
    }

    componentDidMount() {
        let promise;
        promise = activitiesByUser(this.props.user.username);
        promise
            .then(response => {
                const activities = [];
                this.setState({
                    activities: response.content,
                });
            }).catch(error => {
            this.setState({
                isLoading: false
            })
        });
    }

    render() {
        const tagViews = [];
        this.state.tags.forEach((tag, index) => {
            tagViews.push(<TimerTag key={index} tag={tag} tagNumber={index} removeTag={this.removeTag}
                                    handleTagChange={this.handleTagChange}/>);
        });
        const activityOptions = [];
        this.state.activities.forEach((activity) => {
            activityOptions.push(<Option
                key={activity.id}
                title={activity.title}
                value={activity.id}
            >{activity.title}</Option>)
        });

        return (
            <div className="new-poll-container">
                <h1 className="page-title">Create Timer</h1>
                <div className="new-poll-content">
                    <Form onSubmit={this.handleSubmit} className="create-poll-form">
                        {tagViews}
                        <FormItem className="poll-form-row">
                            <Button type="dashed" onClick={this.addTag}
                                    disabled={this.state.tags.length === MAX_CHOICES}>
                                <Icon type="plus"/> Add a tag
                            </Button>
                        </FormItem>
                        <FormItem className="poll-form-row">
                            <Select onChange={this.handleActivityChange}
                                    onSelect={this.handleActivityChange}>
                                {activityOptions}
                            </Select>
                        </FormItem>
                        <FormItem className="poll-form-row">
                            <Button type="primary"
                                    htmlType="submit"
                                    size="large"
                                    disabled={this.isFormInvalid()}
                                    className="create-poll-form-button">Create Timer</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );
    }
}

function TimerTag(props) {
    return (
        <FormItem validateStatus={props.tag.validateStatus}
                  help={props.tag.errorMsg} className="poll-form-row">
            <Input
                placeholder={'Choice ' + (props.tagNumber + 1)}
                size="large"
                value={props.tag.text}
                className={props.tagNumber > 1 ? "optional-choice" : null}
                onChange={(event) => props.handleTagChange(event, props.tagNumber)}/>

            {
                props.tagNumber > 1 ? (
                    <Icon
                        className="dynamic-delete-button"
                        type="close"
                        disabled={props.tagNumber <= 1}
                        onClick={() => props.removeChoice(props.tagNumber)}
                    />) : null
            }
        </FormItem>
    );
}


export default NewTimer;