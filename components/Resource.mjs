/**
 * Resource for operating the site. This should be fetched from
 * samizdat.io rather than hard-coded. Dynamic data should update at
 * regular intervals.
 */
export default class Resource {
    static async domains() {
        return [
            "abc123.com","def456.com","ghi789.net"
        ]
    }
    static async sites() {
        return [
            {"name": "New York Times","url": "https://www.nytimes.com"},
            {"name": "Associated Press - World News","url": "https://apnews.com/hub/world-news"},
            {"name": "Al Jazeera","url": "https://www.aljazeera.com/"}
        ]
    }
}