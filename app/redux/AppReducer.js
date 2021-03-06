import {Map, OrderedMap} from 'immutable';
import { translate } from 'app/Translator';

const defaultState = Map({
    requests: {},
    loading: false,
    error: '',
    location: {},
    notifications: null,
    notificounters: Map({
        total: 0,
        feed: 0,
        reward: 0,
        send: 0,
        mention: 0,
        follow: 0,
        vote: 0,
        reply: 0,
        account_update: 0,
        message: 0,
        receive: 0
    })
});

export default function reducer(state = defaultState, action) {
    if (action.type === '@@router/LOCATION_CHANGE') {
        return state.set('location', {pathname: action.payload.pathname});
    }
    if (action.type === 'STEEM_API_ERROR') {
        return state.set('error', action.error).set('loading', false);
    }
    if (action.type === 'WS_CONNECTION_STATUS') {
        return state.updateIn(['ws_connection'], value => {
            if (value && value.status === action.payload.status) return value;
            return {status: action.payload.status, updated_at: new Date()};
        });
    }
    let res = state;
    if (action.type === 'RPC_REQUEST_STATUS') {
        const request_id = action.payload.id + '';
        if (action.payload.event === 'BEGIN') {
            res = state.mergeDeep({loading: true, requests: {[request_id]: Date.now()}});
        }
        if (action.payload.event === 'END' || action.payload.event === 'ERROR') {
            res = res.deleteIn(['requests', request_id]);
            const loading = res.get('requests').size > 0;
            res = res.set('loading', loading);
        }
    }
    if (action.type === 'ADD_NOTIFICATION') {
        const n = {
            action: translate('dismiss'),
            dismissAfter: 10000,
            ...action.payload
        };
        res = res.update('notifications', s => {
            return s ? s.set(n.key, n) : OrderedMap({[n.key]: n});
        });
    }
    if (action.type === 'REMOVE_NOTIFICATION') {
        res = res.update('notifications', s => s.delete(action.payload.key));
    }
    if (action.type === 'UPDATE_NOTIFICOUNTERS' && action.payload) {
        const nc = action.payload;
        if (nc.follow > 0) {
            nc.total -= nc.follow;
            nc.follow = 0;
        }
        res = res.set('notificounters', Map(nc));
    }
    return res;
}
