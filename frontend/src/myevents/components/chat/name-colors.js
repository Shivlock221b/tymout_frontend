/**
 * Utility for generating consistent colors for user names in chat
 */

// Array of vibrant but readable colors for user names
const NAME_COLORS = [
  'text-indigo-600',    // Indigo
  'text-blue-600',      // Blue
  'text-emerald-600',   // Emerald
  'text-amber-600',     // Amber
  'text-rose-600',      // Rose
  'text-violet-600',    // Violet
  'text-cyan-600',      // Cyan
  'text-fuchsia-600',   // Fuchsia
  'text-teal-600',      // Teal
  'text-orange-600',    // Orange
];

/**
 * Gets a consistent color for a user based on their ID or name
 * @param {string} identifier - User ID or name to generate color for
 * @returns {string} Tailwind CSS color class
 */
export const getColorForName = (identifier) => {
  if (!identifier) return NAME_COLORS[0];
  
  // Generate a simple hash from the identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Get a consistent index from the hash
  const index = Math.abs(hash) % NAME_COLORS.length;
  return NAME_COLORS[index];
};

export default getColorForName;
