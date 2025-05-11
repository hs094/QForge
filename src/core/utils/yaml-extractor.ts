/**
 * Extracts YAML code blocks from a text string
 * @param text Text containing YAML code blocks
 * @returns Extracted YAML content
 */
export function extractYamlFromText(text: string): string {
  // Check if the text is already valid YAML
  if (isLikelyYaml(text)) {
    return text;
  }
  
  // Look for code blocks with YAML content
  const yamlCodeBlockRegex = /```(?:yaml|yml)?\s*([\s\S]*?)```/g;
  const matches = [...text.matchAll(yamlCodeBlockRegex)];
  
  if (matches.length > 0) {
    // Get the largest code block (most likely the complete pipeline)
    const largestMatch = matches.reduce((largest, current) => {
      return (current[1].length > largest[1].length) ? current : largest;
    }, matches[0]);
    
    return largestMatch[1].trim();
  }
  
  // If no code blocks found, try to extract content that looks like YAML
  const lines = text.split('\n');
  const yamlLines: string[] = [];
  let inYamlSection = false;
  
  for (const line of lines) {
    // Lines that likely indicate YAML content
    if (line.trim().startsWith('name:') || 
        line.trim().startsWith('on:') || 
        line.trim().startsWith('jobs:') ||
        line.trim().startsWith('Resources:') ||
        line.trim().startsWith('AWSTemplateFormatVersion:')) {
      inYamlSection = true;
    }
    
    if (inYamlSection) {
      yamlLines.push(line);
    }
  }
  
  if (yamlLines.length > 0) {
    return yamlLines.join('\n');
  }
  
  // If all else fails, return the original text
  return text;
}

/**
 * Checks if a string is likely to be YAML content
 * @param text Text to check
 * @returns True if the text is likely YAML, false otherwise
 */
function isLikelyYaml(text: string): boolean {
  const lines = text.split('\n');
  let yamlIndicators = 0;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Count lines that look like YAML key-value pairs or list items
    if (/^[a-zA-Z0-9_-]+:/.test(trimmedLine) || /^- /.test(trimmedLine)) {
      yamlIndicators++;
    }
    
    // Check for common YAML structures
    if (trimmedLine === 'name:' || 
        trimmedLine === 'on:' || 
        trimmedLine === 'jobs:' ||
        trimmedLine === 'Resources:' ||
        trimmedLine.startsWith('AWSTemplateFormatVersion:')) {
      yamlIndicators += 5; // Give more weight to these indicators
    }
  }
  
  // If more than 30% of non-empty lines look like YAML, it's likely YAML
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  return (yamlIndicators / nonEmptyLines) > 0.3;
}
