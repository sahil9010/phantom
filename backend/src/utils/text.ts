
// Helper for finding mentioned users
export const findMentionedUsers = (text: string): string[] => {
    // Regex for @username (assumes simple usernames for now, ideally matched against DB)
    // Matches @word characters until space or end
    const mentions = text.match(/@(\w+)/g);
    if (!mentions) return [];
    // Remove the '@' symbol
    return mentions.map(m => m.slice(1));
};
