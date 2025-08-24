/**
 * Extracts and validates email addresses from a string
 * @param text The input string that may contain email addresses
 * @returns An array of valid email addresses found in the string
 */
function extractEmailsFromString(text: string): string[] {
    // Regular expression to match email addresses
    // This pattern follows RFC 5322 standard for email validation
    const emailRegex = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/gi;

    const matches = text.match(emailRegex);

    if (!matches) {
        return [];
    }

    // Filter valid emails using more precise validation
    const validEmails: string[] = [];
    const seenEmails = new Set<string>();

    for (const match of matches) {
        const email = match.trim();

        // Additional validation beyond regex
        if (isValidEmail(email) && !seenEmails.has(email.toLowerCase())) {
            validEmails.push(email);
            seenEmails.add(email.toLowerCase());
        }
    }

    return validEmails;
}

/**
 * Validates an email address using more precise checks
 * @param email The email address to validate
 * @returns boolean indicating whether the email is valid
 */
function isValidEmail(email: string): boolean {
    // Basic length checks
    if (email.length > 254) return false;

    // Check for @ symbol and proper structure
    const atIndex = email.indexOf('@');
    if (atIndex < 1 || atIndex === email.length - 1) return false;

    // Check local part (before @)
    const localPart = email.slice(0, atIndex);
    if (localPart.length > 64) return false;

    // Check domain part (after @)
    const domainPart = email.slice(atIndex + 1);
    if (domainPart.length > 253) return false;

    // Check for consecutive dots and special characters
    if (email.includes('..')) return false;
    if (email.startsWith('.') || email.endsWith('.')) return false;

    // Check domain has at least one dot
    if (!domainPart.includes('.')) return false;

    return true;
}

/**
 * Checks if a string contains at least one valid email address
 * @param text The input string to check
 * @returns boolean indicating whether at least one email was found
 */
export default function containsEmail(text: string): boolean {
    return extractEmailsFromString(text).length > 0;
}