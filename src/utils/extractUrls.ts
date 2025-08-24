interface UrlExtractionOptions {
  requireProtocol?: boolean; // If true, only URLs with explicit protocol are considered
  normalizeUrls?: boolean;   // If true, adds http:// to www URLs
  uniqueUrls?: boolean;      // If true, returns only unique URLs
}

export default function extractUrls(
    text: string,
    options: UrlExtractionOptions = {}
): string[] {
    const {
        requireProtocol = false,
        normalizeUrls = true,
        uniqueUrls = false
    } = options;

    // Regex pattern based on options
    let pattern: RegExp;
    if (requireProtocol) {
        pattern = /(https?:\/\/|ftp:\/\/)[^\s/$.?#].[^\s]*/gi;
    } else {
        pattern = /(https?:\/\/|ftp:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
    }

    const matches = text.match(pattern) || [];
    const validUrls: string[] = [];

    for (const match of matches) {
        try {
            let url = match;

            // Normalize www URLs if requested
            if (normalizeUrls && url.startsWith('www.')) {
                url = 'http://' + url;
            }

            // Validate URL
            const parsedUrl = new URL(url);
            validUrls.push(parsedUrl.toString());
        } catch (error) {
            // Invalid URL, skip it
            continue;
        }
    }

    // Return unique URLs if requested
    if (uniqueUrls) {
        return [...new Set(validUrls)];
    }

    return validUrls;
}