import { fetchPageViews } from "./fetchPageViews";

export default function infiniteScroll() {
    const siteId = "golf.sivert.io"; // Replace with your Plausible site ID
    let link = document.querySelector('link[rel="next"]')?.getAttribute('href');

    if (!link) {
        return;
    }

    // Fetch and update views for existing posts on page load
    const existingPosts = document.querySelectorAll(".post");
    existingPosts.forEach((post) => {
        const postUrl = post.querySelector(".gh-card-link")?.getAttribute("href");
        const viewsElement = document.getElementById(postUrl);

        if (postUrl && viewsElement) {
            fetchPageViews(postUrl, siteId).then((views) => {
                viewsElement.textContent = `${views} views`;
            });
        }
    });

    const options = {
        rootMargin: "150px",
    };

    const callback = (entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && link) {
                getNextPage(link)
                    .then(({ posts, nextLink }) => {
                        const postFeed = document.querySelector(".gh-postfeed");

                        posts.forEach((post) => {
                            postFeed.append(post);

                            // Fetch views for each new post
                            const postUrl = post.querySelector(".gh-card-link")?.getAttribute("href");
                            const viewsElement = post.querySelector(".gh-card-meta[id]");

                            if (postUrl && viewsElement) {
                                fetchPageViews(postUrl, siteId).then((views) => {
                                    viewsElement.textContent = `${views} views`;
                                });
                            }
                        });

                        if (nextLink) {
                            link = nextLink;
                            observer.observe(document.querySelector(".post:last-of-type"));
                        } else {
                            observer.disconnect();
                        }
                    })
                    .catch((error) => console.error("Failed to fetch next page:", error));
            }
        });
    };

    let observer = new IntersectionObserver(callback, options);
    observer.observe(document.querySelector(".post:last-of-type"));
}

// Fetch and parse next page function
async function getNextPage(url) {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Failed to fetch page");
        }

        const nextPageHtml = await res.text();
        const parser = new DOMParser();
        const parsed = parser.parseFromString(nextPageHtml, "text/html");
        const posts = parsed.querySelectorAll(".post");
        const nextLink = parsed.querySelector('link[rel="next"]')?.getAttribute("href");

        return { posts, nextLink };
    } catch (error) {
        throw new Error(error);
    }
}
