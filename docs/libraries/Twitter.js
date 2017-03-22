class Twitter {
  /* intent :: String -> IO () */
  static intent(content) {
    if (!('text' in content)) {
      console.error('Twitter Error: content has no text.');
      return M_IO.unit(null);
    } else {
      return new M_IO((world) => {
        let text = encodeURIComponent(content.text),
          url = ('url' in content) ? '&url=' + encodeURIComponent(content.url) : '',
          hashtags = ('hashtags' in content) ? ('&hashtags=' + content.hashtags.join(',')) : '',
          via = ('via' in content) ? '&via=' + encodeURIComponent(content.via) : '',
          related = ('related' in content) ? '&related=' + encodeURIComponent(content.related) : '',
          in_reply_to = ('in_reply_to' in content) ? '&in-reply-to=' + content.in_reply_to : '',
          language = ('lang' in content) ? '&lang=' + content.lang : '',
          popup = ('popup' in content) ? content.popup : false,
          twitterPath = "https://twitter.com/intent/tweet?text=" + text + url + hashtags + via + related + in_reply_to + language;

        if (popup) {
          world.open(twitterPath, '_blank');
        } else {
          world.location.href = twitterPath;
        }
        return new Tuple(null, world);
      });
    }
  }
}
