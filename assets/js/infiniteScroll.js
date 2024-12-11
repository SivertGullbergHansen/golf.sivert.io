import { fetchTotalVisitors } from "./fetchPageViews";

// Format number like YouTube (e.g., 1.2k, 3.5M)
function formatNumberYouTubeStyle(number) {
    if (number >= 1_000_000_000) {
        return `${(number / 1_000_000_000).toFixed(1)}B`; // Billions
    } else if (number >= 1_000_000) {
        return `${(number / 1_000_000).toFixed(1)}M`; // Millions
    } else if (number >= 1_000) {
        return `${(number / 1_000).toFixed(1)}k`; // Thousands
    }
    return number.toString(); // Less than 1k
}

export default function infiniteScroll() {
    let link = document.querySelector('link[rel="next"]')?.getAttribute("href");

    if (!link) {
        return;
    }

    // Fetch and update views for existing posts on page load
    const existingPosts = document.querySelectorAll(".post");
    existingPosts.forEach((post) => {
        const postUrl = post
            .querySelector(".gh-card-link")
            ?.getAttribute("href");
        const viewsElement = document.getElementById(postUrl);

        // Updated function to display formatted viewer numbers
        if (postUrl && viewsElement) {
            fetchTotalVisitors(postUrl).then((views) => {
                const formattedViews = formatNumberYouTubeStyle(views);
                viewsElement.textContent = `${formattedViews} views`;
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
                            const postUrl = post
                                .querySelector(".gh-card-link")
                                ?.getAttribute("href");
                            const viewsElement =
                                post.querySelector(".gh-card-meta[id]");

                            // Updated function to display formatted viewer numbers
                            if (postUrl && viewsElement) {
                                fetchTotalVisitors(postUrl).then((views) => {
                                    const formattedViews =
                                        formatNumberYouTubeStyle(views);
                                    viewsElement.textContent = `${formattedViews} views`;
                                });
                            }
                        });

                        if (nextLink) {
                            link = nextLink;
                            observer.observe(
                                document.querySelector(".post:last-of-type")
                            );
                        } else {
                            observer.disconnect();
                        }
                    })
                    .catch((error) =>
                        console.error("Failed to fetch next page:", error)
                    );
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
        const nextLink = parsed
            .querySelector('link[rel="next"]')
            ?.getAttribute("href");

        return { posts, nextLink };
    } catch (error) {
        throw new Error(error);
    }
}
