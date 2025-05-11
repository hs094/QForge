import { LanguageAnalyzer } from './language-analyzer';
import { RubyAnalyzer } from './ruby/ruby-analyzer';
import { GoAnalyzer } from './go/go-analyzer';
import { RustAnalyzer } from './rust/rust-analyzer';
import { PhpAnalyzer } from './php/php-analyzer';
import { DotNetAnalyzer } from './dotnet/dotnet-analyzer';

/**
 * Get all available language analyzers
 * @returns Array of language analyzers
 */
export function getLanguageAnalyzers(): LanguageAnalyzer[] {
  return [
    new RubyAnalyzer(),
    new GoAnalyzer(),
    new RustAnalyzer(),
    new PhpAnalyzer(),
    new DotNetAnalyzer()
  ];
}

/**
 * Get a language analyzer by language name
 * @param language Language name
 * @returns Language analyzer or undefined if not found
 */
export function getLanguageAnalyzer(language: string): LanguageAnalyzer | undefined {
  return getLanguageAnalyzers().find(analyzer => 
    analyzer.language.toLowerCase() === language.toLowerCase()
  );
}

export { LanguageAnalyzer, RubyAnalyzer, GoAnalyzer, RustAnalyzer, PhpAnalyzer, DotNetAnalyzer };
