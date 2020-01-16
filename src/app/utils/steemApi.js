import { api } from '@steemit/steem-js';
import { Client } from '@busyorg/busyjs';
import stateCleaner from 'app/redux/stateCleaner';
import axios from 'axios';
import SSC from 'sscjs';
import { CURATION_ACCOUNT } from 'app/client_config';

const ssc = new SSC('https://api.steem-engine.com/rpc');

async function createBusyAPI() {
    return new Promise((resolve, reject) => {
        const client = new Client('wss://api.busy.org');
        client.call('get_notifications', ['ericet'], (err, result) => {
            if (err !== null) reject(err);
            resolve(result);
        });
    });
}

export async function getStateAsync(url) {
    // strip off query string
    const path = url.split('?')[0];
    let raw = await api.getStateAsync(path);
    if (path === '/recommended/' || path === '/recommended') {
        raw = await api.getStateAsync('/@' + CURATION_ACCOUNT + '/feed');
    }
    if (!raw.accounts) {
        raw.accounts = {};
    }
    const urlParts = url.match(/^[\/]?@([^\/]+)\/transfers[\/]?$/);
    raw.notifications = await createBusyAPI();
    if (urlParts) {
        const account = urlParts[1];
        if (!raw.accounts[account]) {
            raw.accounts[account] = await getAccount(account);
        }
        if (!raw.props) {
            raw.props = await Promise.all(getGlobalProps());
        }
        if (!raw.content) {
            raw.content = {};
        }
        if (!raw.accounts[account].transfer_history.length) {
            raw.accounts[account].transfer_history = await getAccountHistory(
                account
            );
        }

        const [tokenBalances, tokenStatuses] = await Promise.all([
            // modified to get all tokens. - by anpigon
            ssc.find('tokens', 'balances', {
                account,
            }),
            getScotAccountDataAsync(account),
        ]);
        if (tokenBalances) {
            raw.accounts[account].token_balances = tokenBalances;
        }
        if (tokenStatuses) {
            raw.accounts[account].all_token_status = tokenStatuses;
        }
    }
    console.log(raw);
    const cleansed = stateCleaner(raw);

    return cleansed;
}

export async function getScotDataAsync(path, params) {
    return callApi(`https://scot-api.steem-engine.com/${path}`, params);
}

export async function getScotAccountDataAsync(account) {
    return getScotDataAsync(`@${account}`, { v: new Date().getTime() });
}

async function getAccount(account) {
    const accounts = await api.getAccountsAsync([account]);
    return accounts && accounts.length > 0 ? accounts[0] : {};
}
async function getGlobalProps() {
    const gprops = await api.getDynamicGlobalPropertiesAsync();
    return gprops;
}
async function getAccountHistory(account) {
    const history = await api.getAccountHistoryAsync(account, -1, 1000);
    let transfers = history.filter(tx => tx[1].op[0] === 'transfer');
    return transfers && transfers.length > 0 ? transfers : {};
}
async function callApi(url, params) {
    return await axios({
        url,
        method: 'GET',
        params,
    })
        .then(response => {
            return response.data;
        })
        .catch(err => {
            console.error(`Could not fetch data, url: ${url}`);
            return {};
        });
}
