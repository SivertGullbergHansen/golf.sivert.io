// Fetch page views from Plausible API
export async function fetchPageViews(url, siteId) {
    try {
        const response = await fetch("https://plausible.sivert.io/api/v2/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                site_id: siteId,
                metrics: ["pageviews"],
                date_range: "all",
                filters: [
                    ["is", "event:page", [url]],
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // Access pageviews from the result
        const pageviews = data.results[0]?.metrics[0] || 0; // Ensure we get the pageviews count
        console.log(`Fetched ${pageviews} views for ${url}`);
        return pageviews; // This will return the page view count (e.g., 1)
    } catch (error) {
        console.error(`Failed to fetch page views for ${url}:`, error);
        return "Error";
    }
}
