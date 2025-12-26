/**
 * Get first name from full name
 * Example: "John Doe Smith" -> "John"
 */
export const getFirstName = (fullName: string): string => {
  if (!fullName || fullName.trim() === '') return 'User';
  return fullName.trim().split(/\s+/)[0];
};

/**
 * Truncate name to max length with ellipsis
 * Example: "VeryLongName" -> "VeryLo..."
 */
export const truncateName = (name: string, maxLength: number = 15): string => {
  if (!name || name.trim() === '') return 'User';
  const trimmed = name.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength - 3) + '...';
};

/**
 * Get display name (first name, truncated if too long)
 * Example: "John Doe Smith" -> "John"
 * Example: "Superlongfirstname Doe" -> "Superlon..."
 */
export const getDisplayName = (
  fullName: string,
  maxLength: number = 15
): string => {
  const firstName = getFirstName(fullName);
  return truncateName(firstName, maxLength);
};

/**
 * Get initials from full name
 * Example: "John Doe Smith" -> "JDS"
 */
export const getInitials = (fullName: string): string => {
  if (!fullName || fullName.trim() === '') return 'U';

  const words = fullName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};
