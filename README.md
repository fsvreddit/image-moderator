A Dev Platform app for detecting AI content in images.

This app uses the Sightengine API to analyse image posts for AI content. To use, you need to sign up to [Sightengine's platform](https://sightengine.com/) and obtain an API user ID and key. You must set the API User in the app settings, and the API key via the subreddit context menu.

For smaller use cases, Sightengine's free tier will be adequate, permitting 100 AI detections per day up to 400/month. For higher usage needs, Sightengine offer paid plans.

## Checking images

Click on the post context menu for any post and choose "Check image for AI Content". If the post is an image post, it will be checked against Sightengine's API key and the likelihood of the post being AI generated will be shown as a popup.

[Example video of usage](https://www.youtube.com/shorts/iArySZaY1oE).

If this is run on a gallery submission, the first image on the gallery will be checked.

## Proactive checking

You can also set the app up to proactively check new posts, or posts approved out of the modqueue. However, this can use a lot of API resource, particularly on busier subreddits. Consider setting a suitable account age and karma threshold to restrict this feature to accounts who are more likely to break rules.

## About this app

This app is open source under the BSD 3-Clause licence. The source code can be found [here](https://github.com/fsvreddit/image-moderator).
