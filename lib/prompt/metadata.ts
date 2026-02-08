/**
 * Formats user-provided metadata into an LLM-friendly prompt section.
 * Metadata is treated as advisory context, not ground truth.
 */

export function formatMetadataForPrompt(
  metadataText?: string
): string {
  if (!metadataText || !metadataText.trim()) {
    return "";
  }

  return `
Additional Context (User-Provided Notes):
The following notes describe business logic, semantics, or caveats.
Use them to improve query accuracy, but do NOT contradict the schema.

${metadataText.trim()}
`.trim();
}
