/**
 * Parses package.json content to extract relevant information
 * @param content Content of package.json file
 * @returns Object containing parsed information
 */
export function parsePackageJson(content: string): {
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  try {
    const packageJson = JSON.parse(content);
    
    // Determine package manager
    let packageManager: string | undefined;
    
    // Check for packageManager field (npm v7+)
    if (packageJson.packageManager) {
      if (packageJson.packageManager.startsWith('npm')) {
        packageManager = 'npm';
      } else if (packageJson.packageManager.startsWith('yarn')) {
        packageManager = 'yarn';
      } else if (packageJson.packageManager.startsWith('pnpm')) {
        packageManager = 'pnpm';
      }
    }
    
    // If not found, infer from lock files or scripts
    if (!packageManager) {
      if (packageJson.scripts) {
        const scripts = Object.values(packageJson.scripts).join(' ');
        if (scripts.includes('yarn')) {
          packageManager = 'yarn';
        } else if (scripts.includes('pnpm')) {
          packageManager = 'pnpm';
        } else {
          packageManager = 'npm'; // Default to npm
        }
      } else {
        packageManager = 'npm'; // Default to npm
      }
    }
    
    return {
      packageManager,
      dependencies: packageJson.dependencies,
      devDependencies: packageJson.devDependencies
    };
  } catch (error) {
    return {};
  }
}
