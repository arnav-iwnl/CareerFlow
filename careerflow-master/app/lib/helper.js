export const entriesToMarkdown = (entries, sectionTitle) => {
  if (!entries || entries.length === 0) return "";
  // Sort entries in reverse chronological order based on startDate
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB - dateA;
  });
  return `## ${sectionTitle.toUpperCase()}\n\n${sortedEntries
    .map(
      (entry) =>
        `### ${entry.title.toUpperCase()} @ ${entry.organization.toUpperCase()}\n${entry.current ? `${entry.startDate} - Present` : `${entry.startDate} - ${entry.endDate}`}\n\n- ${entry.description}`
    )
    .join("\n\n")}`;
};