import extractContent from 'app/utils/ExtractContent';
import { objAccessor } from 'app/utils/Accessors';
import normalizeProfile from 'app/utils/NormalizeProfile';
import { makeCanonicalLink } from 'app/utils/CanonicalLinker.js';
import {
    APP_NAME,
    APP_URL,
    APP_ICON,
    SITE_DESCRIPTION,
    TWITTER_HANDLE,
} from 'app/client_config';

function addSiteMeta(metas) {
    metas.push({ title: 'SteemCN' });
    metas.push({ name: 'description', content: SITE_DESCRIPTION });
    metas.push({ property: 'og:type', content: 'website' });
    metas.push({ property: 'og:site_name', content: APP_NAME });
    metas.push({ property: 'og:title', content: APP_NAME });
    metas.push({ property: 'og:description', content: SITE_DESCRIPTION });
    metas.push({
        property: 'og:image',
        content: `${APP_URL}/images/${APP_ICON}.png`,
    });
    metas.push({ property: 'fb:app_id', content: $STM_Config.fb_app });
    metas.push({ name: 'twitter:card', content: 'summary' });
    metas.push({ name: 'twitter:site', content: TWITTER_HANDLE });
    metas.push({ name: 'twitter:title', content: `#${APP_NAME}` });
    metas.push({ name: 'twitter:description', SITE_DESCRIPTION });
    metas.push({
        name: 'twitter:image',
        content: `${APP_URL}/images/${APP_ICON}.png`,
    });
}

export default function extractMeta(chain_data, rp) {
    const metas = [];
    if (rp.username && rp.slug) {
        // post
        const post = `${rp.username}/${rp.slug}`;
        const content = chain_data.content[post];
        const author = chain_data.accounts[rp.username];
        const profile = normalizeProfile(author);
        if (content && content.id !== '0.0.0') {
            // API currently returns 'false' data with id 0.0.0 for posts that do not exist
            const d = extractContent(objAccessor, content, false);
            const url = APP_URL + d.link;
            const canonicalUrl = makeCanonicalLink(d);
            const title = d.title + ` — ${APP_NAME}`;
            const desc = d.desc + ' by ' + d.author;
            const image = d.image_link || profile.profile_image;
            const { category, created } = d;

            // Standard meta
            metas.push({ title });
            metas.push({ canonical: canonicalUrl });
            metas.push({ name: 'description', content: desc });

            // Open Graph data
            metas.push({ name: 'og:title', content: title });
            metas.push({ name: 'og:type', content: 'article' });
            metas.push({ name: 'og:url', content: url });
            metas.push({
                name: 'og:image',
                content: image || `${APP_URL}/images/${APP_ICON}.png`,
            });
            metas.push({ name: 'og:description', content: desc });
            metas.push({ name: 'og:site_name', content: APP_NAME });
            metas.push({ name: 'fb:app_id', content: $STM_Config.fb_app });
            metas.push({ name: 'article:tag', content: category });
            metas.push({
                name: 'article:published_time',
                content: created,
            });

            // Twitter card data
            metas.push({
                name: 'twitter:card',
                content: image ? 'summary_large_image' : 'summary',
            });
            metas.push({ name: 'twitter:site', content: TWITTER_HANDLE });
            metas.push({ name: 'twitter:title', content: title });
            metas.push({ name: 'twitter:description', content: desc });
            metas.push({
                name: 'twitter:image',
                content: image || `${APP_URL}/images/${APP_ICON}.png`,
            });
        } else {
            addSiteMeta(metas);
        }
    } else if (rp.accountname) {
        // user profile root
        const account = chain_data.accounts[rp.accountname];
        let { name, about, profile_image } = normalizeProfile(account);
        if (name == null) name = account.name;
        if (about == null)
            about = `Join thousands on ${
                APP_NAME
            } who share, post and earn rewards.`;
        if (profile_image == null)
            profile_image = `${APP_URL}/images/${APP_ICON}.png`;
        // Set profile tags
        const title = `@${account.name}`;
        const desc = `The latest posts from ${name}. Follow me at @${
            account.name
        }. ${about}`;
        const image = profile_image;

        // Standard meta
        metas.push({ name: 'description', content: desc });

        // Twitter card data
        metas.push({ name: 'twitter:card', content: 'summary' });
        metas.push({ name: 'twitter:site', content: TWITTER_HANDLE });
        metas.push({ name: 'twitter:title', content: title });
        metas.push({ name: 'twitter:description', content: desc });
        metas.push({ name: 'twitter:image', content: image });
    } else {
        // site
        addSiteMeta(metas);
    }
    return metas;
}
