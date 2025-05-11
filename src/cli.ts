#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generatePipeline } from './core/generator';
import { analyzeProject } from './core/analyzer';
import { ProjectProfile } from './types';
import { Logger } from './core/utils/logger';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';

const program = new Command();

// Define CLI version and description
program
  .name('qforge')
  .description('Intelligent CI/CD Pipeline Generator using Amazon Q Developer')
  .version('0.1.0')
  .option('-d, --debug', 'Enable debug mode', false);

// Generate command
program
  .command('generate')
  .description('Generate a CI/CD pipeline for the current project')
  .option('-p, --platform <platform>', 'CI/CD platform (github, aws, gitlab, circleci)', 'github')
  .option('-d, --directory <directory>', 'Project directory', '.')
  .option('-o, --output <output>', 'Output file path')
  .option('-y, --yes', 'Skip confirmation prompts', false)
  .action(async (options) => {
    try {
      const projectPath = path.resolve(options.directory);

      // Check if directory exists
      if (!fs.existsSync(projectPath)) {
        console.error(chalk.red(`Error: Directory ${projectPath} does not exist`));
        process.exit(1);
      }

      console.log(chalk.blue(`\n🔍 Analyzing project in ${projectPath}...\n`));

      // Analyze project
      const spinner = ora('Scanning project files...').start();
      const projectProfile = await analyzeProject(projectPath);
      spinner.succeed('Project analysis complete');

      // Display project analysis results
      console.log(chalk.green('\n📊 Project Analysis Results:'));
      console.log(`  Languages: ${chalk.yellow(projectProfile.languages.join(', ') || 'None detected')}`);
      console.log(`  Frameworks: ${chalk.yellow(projectProfile.frameworks.join(', ') || 'None detected')}`);
      console.log(`  Test Frameworks: ${chalk.yellow(projectProfile.testFrameworks.join(', ') || 'None detected')}`);
      console.log(`  Build Tools: ${chalk.yellow(projectProfile.buildTools.join(', ') || 'None detected')}`);

      // Display language-specific information if available
      if (projectProfile.languageSpecificInfo && Object.keys(projectProfile.languageSpecificInfo).length > 0) {
        console.log(chalk.green('\n🔍 Language-Specific Details:'));

        for (const [language, info] of Object.entries(projectProfile.languageSpecificInfo)) {
          console.log(chalk.cyan(`  ${language.charAt(0).toUpperCase() + language.slice(1)}:`));

          for (const [key, value] of Object.entries(info)) {
            // Format the key with spaces between camelCase
            const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
            const displayKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

            console.log(`    ${displayKey}: ${chalk.yellow(String(value))}`);
          }
        }
      }

      // If not using --yes flag, prompt for confirmation and additional options
      let generateOptions = {
        platform: options.platform,
        testCoverage: true,
        linting: true,
        security: true,
        selfHealing: false
      };

      if (!options.yes) {
        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed with pipeline generation?',
            default: true
          },
          {
            type: 'list',
            name: 'platform',
            message: 'Select CI/CD platform:',
            choices: ['github', 'aws', 'gitlab', 'circleci'],
            default: options.platform,
            when: (answers) => answers.proceed
          },
          {
            type: 'checkbox',
            name: 'features',
            message: 'Select additional features:',
            choices: [
              { name: 'Test Coverage', value: 'testCoverage', checked: true },
              { name: 'Linting', value: 'linting', checked: true },
              { name: 'Security Scanning', value: 'security', checked: true },
              {
                name: 'Advanced Self-Healing',
                value: 'selfHealing',
                checked: false,
                description: 'Intelligent failure analysis, automatic retries, and fix suggestions'
              }
            ],
            when: (answers) => answers.proceed
          }
        ]);

        if (!answers.proceed) {
          console.log(chalk.yellow('Pipeline generation cancelled.'));
          process.exit(0);
        }

        generateOptions = {
          platform: answers.platform,
          testCoverage: answers.features?.includes('testCoverage') ?? true,
          linting: answers.features?.includes('linting') ?? true,
          security: answers.features?.includes('security') ?? true,
          selfHealing: answers.features?.includes('selfHealing') ?? false
        };
      }

      // Generate pipeline
      console.log(chalk.blue(`\n🚀 Generating ${generateOptions.platform} pipeline...\n`));
      const spinnerGen = ora('Generating pipeline configuration...').start();

      const pipeline = await generatePipeline(projectProfile, generateOptions);
      spinnerGen.succeed('Pipeline generation complete');

      // Determine output path
      let outputPath = options.output;
      if (!outputPath) {
        switch (generateOptions.platform) {
          case 'github':
            outputPath = path.join(projectPath, '.github/workflows/ci.yml');
            break;
          case 'aws':
            outputPath = path.join(projectPath, 'aws-pipeline.yml');
            break;
          case 'gitlab':
            outputPath = path.join(projectPath, '.gitlab-ci.yml');
            break;
          case 'circleci':
            outputPath = path.join(projectPath, '.circleci/config.yml');
            break;
          default:
            outputPath = path.join(projectPath, '.github/workflows/ci.yml');
        }
      }

      // Ensure directory exists
      await fs.ensureDir(path.dirname(outputPath));

      // Write pipeline to file
      await fs.writeFile(outputPath, pipeline.content);

      console.log(chalk.green(`\n✅ Pipeline configuration saved to: ${outputPath}`));
      console.log(chalk.blue('\nNext steps:'));
      console.log(`  1. Review the generated pipeline configuration`);
      console.log(`  2. Commit the changes to your repository`);
      console.log(`  3. Push to trigger the pipeline`);

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// Execute the program
program.parse(process.argv);

// Enable debug mode if requested
if (program.opts().debug) {
  Logger.setDebugMode(true);
  Logger.debug('Debug mode enabled');
}

// If no arguments, show help
if (process.argv.length === 2) {
  program.help();
}
