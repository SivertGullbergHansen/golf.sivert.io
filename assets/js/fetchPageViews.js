export async function fetchTotalVisitors(pagePath) {
    try {
        // Base URL for fetching stats
        const baseUrl =
            "https://plausible.sivert.io/api/stats/golf.sivert.io/top-stats/";
        const date = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD

        // Construct the query string dynamically
        const params = new URLSearchParams({
            period: "all",
            date: date,
            filters: JSON.stringify([["is", "event:page", [pagePath]]]),
            with_imported: "true",
            comparison: "previous_period",
            compare_from: "undefined",
            compare_to: "undefined",
            match_day_of_week: "true",
        });

        // Fetch the data
        const response = await fetch(`${baseUrl}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Extract the unique visitors from the response
        const uniqueVisitors =
            data.top_stats.find((stat) => stat.name === "Total visits")
                ?.value || 0;
        console.log(`Total unique visitors for ${pagePath}:`, uniqueVisitors);
        return uniqueVisitors; // Return the total unique visitors
    } catch (error) {
        console.error(`Failed to fetch total visitors for ${pagePath}:`, error);
        return "Error";
    }
}
