const request_base = {
    method: 'post',
    mode: 'no-cors',
    credentials: 'same-origin',
    headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
    }
};

export function serverApiLogin(account) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, account})});
    fetch('/api/v1/login_account', request);
}

export function serverApiLogout() {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf})});
    fetch('/api/v1/logout_account', request);
}

let last_call;
export function serverApiRecordEvent(type, val) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    if (last_call && (new Date() - last_call < 60000)) return;
    last_call = new Date();
    const value = val && val.stack ? `${val.toString()} | ${val.stack}` : val;
    const request = Object.assign({}, request_base, {body: JSON.stringify({csrf: $STM_csrf, type, value})});
    fetch('/api/v1/record_event', request);
}

const NTYPES = ['total', 'feed', 'reward', 'transfer', 'mention', 'follow', 'vote', 'comment_reply', 'post_reply', 'key_update', 'message'];

function notificationsArrayToObject(data) {
    const notifications = data && data.length ? data : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    return notifications.reduce((result, n, i) => {
        result[NTYPES[i]] = n;
        return result;
    }, {});
}

export function getNotifications(account) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {method: 'get'});
    return fetch(`/api/v1/notifications/${account}`, request).then(r => r.json()).then(res => {
        return notificationsArrayToObject(res);
    });
}

export function markNotificationRead(account, nn) {
    if (!process.env.BROWSER || window.$STM_ServerBusy) return;
    const request = Object.assign({}, request_base, {method: 'put', mode: 'cors'});
    return fetch(`/api/v1/notifications/${account}/${NTYPES.indexOf(nn)}`, request).then(r => r.json()).then(res => {
        return notificationsArrayToObject(res);
    });
}

if (process.env.BROWSER) {
    window.getNotifications = getNotifications;
    window.markNotificationRead = markNotificationRead;
}
