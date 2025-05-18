import { Post } from "@devvit/public-api";

export function domainFromUrl (url: string): string | undefined {
    if (!url || url.startsWith("/")) {
        // Reddit internal link or crosspost
        return;
    }

    const hostname = new URL(url).hostname;
    const trimmedHostname = hostname.startsWith("www.") ? hostname.substring(4) : hostname;

    return trimmedHostname;
}

export function getImageURLFromPost (post: Post): string | undefined {
    const domain = domainFromUrl(post.url);
    if (domain === "i.redd.it" || domain === "i.imgur.com") {
        // Reddit internal link or Imgur link
        return post.url;
    }

    if (post.url.startsWith("https://www.reddit.com/gallery/")) {
        const gallery = post.gallery;
        if (gallery.length > 0) {
            return gallery[0].url;
        }
    }
}

export function postIsImage (post: Post): boolean {
    const url = getImageURLFromPost(post);
    return url !== undefined;
}
