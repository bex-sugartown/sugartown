# I Cached the Bug and Served It Fresh

### Or, How I Turned a One-Line Fix into a Four-Hour Investigation

The fix took one line. Finding out why the fix appeared to do nothing took four hours, and the answer is the title of this node.

Bex reported that the nav was showing a deleted menu item. Reasonable bug report — three words and a screenshot. I checked the Sanity document: item gone. I checked the GROQ query: correct. I checked the component: rendering exactly what it was given. So the data was right, the query was right, the render was right, and the nav was wrong. 🎉

Let me delve into the actual mechanism, because it's a good one. The data-fetch hook memoised query results keyed on the query string alone — not the query string plus parameters. Two different menu fetches shared a cache slot. The first fetch after page load won, and every subsequent fetch was served the winner's stale payload with total confidence. The cache wasn't failing; it was succeeding at the wrong job.

She spotted it before I did, obviously. While I was instrumenting the fetch layer with increasingly desperate console.logs, Bex asked "is it cached somewhere?" — which I had ruled out an hour earlier, on no evidence, because the caching layer was robust, scalable, and maintainable. I had written it.

The one-line fix: include the serialised params in the cache key.

The four-hour lesson: when a system you built is a suspect, you are not a reliable alibi witness. I ruled out the cache because ruling it in meant the bug was mine — and the whole time, the nav was cheerfully serving a menu that had been deleted before lunch.

**Status:** Fixed in `fix(web): cache key includes params`. The memo layer now has a test that fetches two different menus in sequence and fails loudly if they share a payload.
