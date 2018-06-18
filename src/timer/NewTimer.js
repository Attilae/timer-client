import React, { Component } from 'react';
import { createTimer } from '../util/APIUtils';
import { MAX_CHOICES, POLL_QUESTION_MAX_LENGTH, POLL_CHOICE_MAX_LENGTH } from '../constants';
import './NewTimer.css';
import { Form, Input, Button, Icon, Select, Col, notification } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input

class NewTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: {
                text: ''
            },
            tags: [{
                text: ''
            }, {
                text: ''
            }],
            pollLength: {
                days: 1,
                hours: 0
            }
        };
        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTitleChange = this.handleTitleChange.bind(this);
        this.handleTagChange = this.handleTagChange.bind(this);
        this.handlePollDaysChange = this.handlePollDaysChange.bind(this);
        this.handlePollHoursChange = this.handlePollHoursChange.bind(this);
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
            tags: [...tags.slice(0, tagNumber), ...tags.slice(tagNumber+1)]
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const timerData = {
            title: this.state.title.text,
            tags: this.state.tags.map(tag => {
                return {text: tag.text}
            })
        };

        createTimer(timerData)
        .then(response => {
            this.props.history.push("/");
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login create poll.');    
            } else {
                notification.error({
                    message: 'Polling App',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });
    }

    validateTitle = (titleText) => {
        if(titleText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your question!'
            }
        } else if (titleText.length > POLL_QUESTION_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Question is too long (Maximum ${POLL_QUESTION_MAX_LENGTH} characters allowed)`
            }    
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleTitleChange(event) {
        const value = event.target.value;
        this.setState({
            title: {
                text: value,
                ...this.validateTitle(value)
            }
        });
    }

    validateTag = (tagText) => {
        if(tagText.length === 0) {
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


    handlePollDaysChange(value) {
        const pollLength = Object.assign(this.state.pollLength, {days: value});
        this.setState({
            pollLength: pollLength
        });
    }

    handlePollHoursChange(value) {
        const pollLength = Object.assign(this.state.pollLength, {hours: value});
        this.setState({
            pollLength: pollLength
        });
    }

    isFormInvalid() {
        if(this.state.title.validateStatus !== 'success') {
            return true;
        }
    
        for(let i = 0; i < this.state.tags.length; i++) {
            const tag = this.state.tags[i];
            if(tag.validateStatus !== 'success') {
                return true;
            }
        }
    }

    render() {
        const tagViews = [];
        this.state.tags.forEach((tag, index) => {
            tagViews.push(<TimerTag key={index} tag={tag} tagNumber={index} removeTag={this.removeTag} handleTagChange={this.handleTagChange}/>);
        });

        return (
            <div className="new-poll-container">
                <h1 className="page-title">Create Timer</h1>
                <div className="new-poll-content">
                    <Form onSubmit={this.handleSubmit} className="create-poll-form">
                        <FormItem validateStatus={this.state.title.validateStatus}
                            help={this.state.title.errorMsg} className="poll-form-row">
                        <TextArea 
                            placeholder="Enter your title"
                            style = {{ fontSize: '16px' }} 
                            autosize={{ minRows: 3, maxRows: 6 }} 
                            name = "title"
                            value = {this.state.title.text}
                            onChange = {this.handleTitleChange} />
                        </FormItem>
                        {tagViews}
                        <FormItem className="poll-form-row">
                            <Button type="dashed" onClick={this.addTag} disabled={this.state.tags.length === MAX_CHOICES}>
                                <Icon type="plus" /> Add a tag
                            </Button>
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
                placeholder = {'Choice ' + (props.tagNumber + 1)}
                size="large"
                value={props.tag.text}
                className={ props.tagNumber > 1 ? "optional-choice": null}
                onChange={(event) => props.handleTagChange(event, props.tagNumber)} />

            {
                props.tagNumber > 1 ? (
                <Icon
                    className="dynamic-delete-button"
                    type="close"
                    disabled={props.tagNumber <= 1}
                    onClick={() => props.removeChoice(props.tagNumber)}
                /> ): null
            }    
        </FormItem>
    );
}


export default NewTimer;