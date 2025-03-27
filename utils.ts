export const MIN_DRAFT_PROMPT_WORDS_LENGTH = 20;

export const emptyDoc = "{\"type\": \"doc\",\"content\":[{\"type\": \"paragraph\"}]}";

export function formatDate(date: Date): string {
    const pad = (num: number) => (num < 10 ? "0" + num : num); // Helper function to pad single digits
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are zero-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function countWords(text: string): number {
    // Trim leading and trailing spaces and split by whitespace
    const words = text.trim().split(/\s+/);

    // Filter out any empty strings (in case of multiple spaces)
    return words.filter((word) => word.length > 0).length;
}

export function isEmptyDocument(content: string): boolean {
    try {
        // Parse the JSON string
        const parsedContent = JSON.parse(content);

        // Check for the required structure
        return parsedContent.type === "doc" &&
                Array.isArray(parsedContent.content) &&
                parsedContent.content.length === 1 &&
                parsedContent.content[0].type === "paragraph" &&
                parsedContent.content[0].content == null;
    } catch (e) {
        // If parsing fails, the structure is not valid
        return false;
    }
}
