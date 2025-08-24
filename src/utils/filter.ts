
import extractUrls from './extractUrls';
import extractEmails from './extractEmails';

const MIN_MESSAGE_LENGTH = 5;
const SINGLE_WORD_LENGTH = 8;

const COMMON_MESSAGES = [
    "hello", "hi", "hey", "thanks", "thank you", "lol", "lmao", "rofl",
    "i hope", "sorry", "no", "money", "please?", "stfu", "ew", "wbu", "ugh",
    "what"
]

const KEYWORDS = [
    'exploit', 'vulnerability', 'cve-', '0day', 'malware', 'ransomware',
    'trojan', 'botnet', 'ddos', 'phishing', 'brute force', 'sql injection',
    'xss', 'csrf', 'reverse shell', 'payload', 'backdoor', 'rootkit',
    'privilege escalation', 'bypass', 'firewall', 'ids', 'ips', 'siem',
    'ioc', 'threat intel', 'apt', 'breach', 'leak', 'dump', 'credentials',
    'access', 'compromise', 'infiltration', 'exfiltration', 'persistence',
    'lateral movement', 'command and control', 'c2', 'beacon', 'stager',
    'loader', 'dropper', 'obfuscation', 'encryption', 'decryption', 'keylogger',
    'rat', 'remote access', 'vpn', 'proxy', 'tor', 'i2p', 'dark web',
    'clear web', 'surface web', 'osint', 'recon', 'enumeration', 'scanning',
    'port scan', 'vulnerability assessment', 'pen test', 'red team', 'blue team',
    'purple team', 'social engineering', 'physical security', 'wireless', 'wifi',
    'bluetooth', 'rfid', 'nfc', 'iot', 'scada', 'ics', 'industrial control',
    'critical infrastructure', 'government', 'financial', 'healthcare', 'education',
    'energy', 'transportation', 'telecommunications', 'supply chain', 'third party',
    'insider threat', 'espionage', 'sabotage', 'activism', 'hacktivism', 'cybercrime',
    'cyber warfare', 'information warfare', 'psychological operations', 'influence operations',
    'disinformation', 'misinformation', 'fake news', 'deepfake', 'synthetic media',
    'ai security', 'machine learning security', 'quantum computing', 'post quantum cryptography',
    'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'monero', 'privacy coin',
    'mixer', 'tumbler', 'money laundering', 'extortion', 'blackmail', 'doxing',
    'swatting', 'doxxing', 'reputation damage', 'defamation', 'libel', 'slander'
];

// returns true if message is to be ignored
export default function (message: string): boolean {

    // if the message contains a URL
    const urls = extractUrls(message, { requireProtocol: false, normalizeUrls: true, uniqueUrls: true });
    if (urls.length > 0) {
        return false;
    }


    const containsEmails = extractEmails(message);
    if (containsEmails) {
        return false;
    }

    if (message.length < MIN_MESSAGE_LENGTH) {
        return true;
    }

    const stabalised = message.toLowerCase().trim();

    // Check for keywords
    for (const keyword of KEYWORDS) {
        if (stabalised.includes(keyword)) {
            return false;
        }
    }

    // Check for common messages
    if (COMMON_MESSAGES.includes(stabalised)) {
        return true;
    }

    // is the message a single word
    if (stabalised.split(" ").length === 1) {

        // is it shorter than SINGLE_WORD_LENGTH
        if (stabalised.length < SINGLE_WORD_LENGTH) {
            return true;
        }

    }

    // filter out messages that are 2-3 words long where each word is shorter than SINGLE_WORD_LENGTH
    const words = stabalised.split(" ");
    if (words.length >= 2 && words.length <= 3) {
        if (words.every(word => word.length < SINGLE_WORD_LENGTH)) {
            return true;
        }
    }

    return false;
}