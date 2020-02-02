import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import tt from 'counterpart';
import _ from 'lodash';
import Icon from 'app/components/elements/Icon';
import TimeAgoWrapper from 'app/components/elements/TimeAgoWrapper';
import Userpic from 'app/components/elements/Userpic';

const notificationsIcon = type => {
    const types = {
        reply: 'chatbox',
        reply_post: 'chatbox',
        reply_comment: 'chatbox',
        follow: 'voters',
        set_label: 'pencil2',
        set_role: 'pencil2',
        vote: 'chevron-down-circle',
        error: 'cog',
        reblog: 'reblog',
        mention: 'chatboxes',
        transfer:'transfer'
    };
    let icon = 'chain';
    if (type in types) {
        icon = types[type];
    } else {
        console.error('no icon for type: ', type);
    }

    return <Icon size="0_8x" name={icon} />;
};



const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {' '}
            {parts.map((part, i) => (
                <span
                    key={i}
                    style={
                        part.toLowerCase() === highlight.toLowerCase()
                            ? { fontWeight: 'bold' }
                            : {}
                    }
                >
                    {part}
                </span>
            ))}{' '}
        </span>
    );
};

const pic = author => {
    return (
        <a href={'/@' + author}>
            <Userpic account={author} />
        </a>
    );
};


export default class NotificationsList extends React.Component {
    render() {
        const { notifications,accountname } = this.props;
        localStorage.setItem('last_timestamp', Math.floor(Date.now() / 1000));
        const renderItem = item => {
            if (item.type === 'mention') {
                let type = item.type;
                let account = item.author;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div
                        key={item.timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                {highlightText(
                                        `${tt('notificationsList_jsx.mention',{account})}`,
                                        `${account}`
                                    )}
                                   
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>
                );
            } else if (item.type === 'transfer') {
                let type = item.type;
                let account = item.from;
                let timestamp = item.timestamp;
                let amount = item.amount;
                return (
                    <div
                        key={timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${accountname}/transfers`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.transfer',{account,amount})}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>

                );
            } else if (item.type === 'reply') {
                let type = item.type;
                let account = item.author;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div
                        key={timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reply',{account})}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>
                );
            } else if (item.type === 'reblog') {
                let type = item.type;
                let account = item.account;
                let timestamp = item.timestamp;
                let permlink = item.permlink;
                return (
                    <div
                        key={timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${accountname}/${permlink}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.reblog',{account})}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>
                );
            } else if (item.type === 'follow') {
                let type = item.type;
                let account = item.follower;
                let timestamp = item.timestamp;
                return (
                    <div
                        key={timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">
                            {pic(`${account}`)}
                        </div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                        `${tt('notificationsList_jsx.follow',{account})}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>
                );
            } else if (item.type === 'vote') {
                let type = item.type;
                let account = item.voter;
                let timestamp = item.timestamp;
                return (
                    <div
                        key={item.timestamp}
                        className="notification__item flex-body"
                    >
                        <div className="flex-row">{pic(`${account}`)}</div>
                        <div className="flex-column">
                            <div className="notification__message">
                                <a href={`/@${account}`}>
                                    {highlightText(
                                         `${tt('notificationsList_jsx.vote',{account})}`,
                                        `${account}`
                                    )}
                                </a>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className="notification__icon">
                                {notificationsIcon(type)}
                            </div>
                            <div className="notification__date">
                                <TimeAgoWrapper date={(new Date(timestamp * 1000)).toJSON()} />
                            </div>
                        </div>
                    </div>
                );
            }
        };

        return (
            <div style={{ lineHeight: '1rem' }}>
                {notifications.map(item => renderItem(item.toJS()))}
            </div>
        );
    }
}
