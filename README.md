A Dev Platform app for detecting AI or other unwanted content in images.

This app uses the Sightengine API to analyse image posts. Detections supported:

* AI-generated images
* Deepfake images
* Minors in images
* Poor quality (blurry) images
* Offensive content (Nazi, white supremacist or terrorist imagery)
* Spammy QR codes or text on an image
* Drug imagery

To use, you need to sign up to [Sightengine's platform](https://sightengine.com/) and obtain an API user ID and key. You must set the API User in the app settings, and the API key via the subreddit context menu.

For many use cases, Sightengine's free tier will be adequate, permitting 500 "operations" per day up to 2,000/month. AI and Deepfake checks use 5 "operations" each, while other checks use 1 each. For higher usage needs, Sightengine offer paid plans.

## Checking images

Click on the post context menu for any post and choose "Check image for AI Content". If the post is an image post, it will be checked against Sightengine's API key and the likelihood of the post being AI generated will be shown as a popup.

[Example video of usage](https://www.youtube.com/shorts/iArySZaY1oE).

If this is run on a gallery submission, the first image on the gallery will be checked only.

## Proactive checking

You can also set the app up to proactively check new posts, or posts approved out of the modqueue. However, this can use a lot of API resource, particularly on busier subreddits.

Consider setting a suitable account age and karma threshold to restrict this feature to accounts who are more likely to break rules. Posts from moderators will never be checked, and by default content from approved users will not be checked (but this can be changed).

If an image is detected as AI, a report like this will be made:

![screenshot](https://github.com/fsvreddit/image-moderator/blob/main/doc_images/screenshot.png?raw=true)

## Change History

### Next

* Add additional detection types

### v1.0

* Initial Release

## About this app

This app is open source under the BSD 3-Clause licence. The source code can be found [here](https://github.com/fsvreddit/image-moderator).

Interested in detections for things other than AI? Get in touch by messaging /u/fsv! The list of possibilities can be seen in Sightengine's documentation [here](https://sightengine.com/docs/models).
