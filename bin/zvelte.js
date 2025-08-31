#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import prompts from 'prompts';

const REPO_URL = 'https://github.com/Queaxtra/sveltekit-shadcn-template.git';
const USAGE_MESSAGE = `Usage: bunx @queaxtra/zvelte create <project-directory> [options]\n\nDescription:\n  Creates a new SvelteKit project using a predefined template.\n\nArguments:\n  <project-directory>  The directory for the new project.\n                       Use '.' to create in the current directory.\n\nOptions:\n  --install[=<pm>]     Installs dependencies using the specified package manager (bun, pnpm, npm, yarn).\n                       If no package manager is specified, you will be prompted to choose.\n  -h, --help           Displays this help message.\n\nExample:\n  bunx @queaxtra/zvelte create my-awesome-project --install=bun
`;

/**
 * Checks if a command is available on the system.
 * @param {string} command - The command to check.
 * @returns {boolean}
 */
function isCommandInstalled(command) {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clones the repository to the specified path.
 * @param {string} projectPath - The path to clone the repository into.
 * @returns {Promise<void>}
 */
async function cloneRepository(projectPath) {
  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', ['clone', REPO_URL, projectPath], {
      stdio: 'inherit'
    });

    gitProcess.on('close', (code) => {
      if (code === 0) {
        return resolve();
      }

      const error = new Error(`Git clone failed with code ${code}`);
      console.error(error.message);
      reject(error);
    });
  });
}

/**
 * Installs dependencies using the specified package manager.
 * @param {string} projectPath - The path to the project.
 * @param {string | null} packageManager - The package manager to use.
 * @returns {Promise<void>}
 */
async function installDependencies(projectPath, packageManager) {
  if (!packageManager) {
    return;
  }

  if (!isCommandInstalled(packageManager)) {
    console.warn(
      `Warning: ${packageManager} is not installed. Skipping dependency installation.`
    );
    return;
  }

  console.log(`Installing dependencies with ${packageManager}...`);
  return new Promise((resolve, reject) => {
    const installProcess = spawn(packageManager, ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\nDependencies installed successfully!');
        return resolve();
      }
      const error = new Error(
        `Dependency installation failed with code ${code}`
      );
      reject(error);
    });
  });
}

/**
 * Creates a new project by cloning a template.
 * This function handles three cases:
 * 1. Cloning into a new or empty directory.
 * 2. Cloning into the current non-empty directory (merging).
 * 3. Erroring if the target directory is non-empty and not the current directory.
 * @param {string} targetDir - The target directory for the project.
 * @returns {Promise<string>} The absolute path to the project.
 */
async function createProject(targetDir) {
  const projectPath = path.resolve(process.cwd(), targetDir);
  const isCurrentDir = targetDir === '.';
  const dirExists = fs.existsSync(projectPath);
  const isDirEmpty = dirExists
    ? fs.readdirSync(projectPath).length === 0
    : true;

  if (dirExists && !isDirEmpty && !isCurrentDir) {
    throw new Error(
      `Directory '${targetDir}' already exists and is not empty.`
    );
  }

  if (isCurrentDir && dirExists && !isDirEmpty) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zvelte-'));

    try {
      console.log('Cloning template repository into a temporary directory...');
      await cloneRepository(tempDir);
      fs.rmSync(path.join(tempDir, '.git'), { recursive: true, force: true });

      const templateFiles = fs.readdirSync(tempDir);
      const projectFiles = fs.readdirSync(projectPath);
      const conflictingFiles = templateFiles.filter((file) =>
        projectFiles.includes(file)
      );

      if (conflictingFiles.length > 0) {
        throw new Error(
          `Aborting. Your directory contains files that would conflict with the template: ${conflictingFiles.join('\n')}`
        );
      }

      console.log('Copying project files...');

      for (const file of templateFiles) {
        fs.cpSync(path.join(tempDir, file), path.join(projectPath, file), {
          recursive: true
        });
      }

      console.log('Project successfully initialized in the current directory.');
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return projectPath;
  }

  console.log(`Creating new project in ${projectPath}...`);
  await cloneRepository(projectPath);
  const gitPath = path.join(projectPath, '.git');

  if (fs.existsSync(gitPath)) {
    try {
      fs.rmSync(gitPath, { recursive: true, force: true });
      console.log('Removed .git directory.');
    } catch (error) {
      console.error(`Failed to remove .git directory: ${error.message}`);
      throw error;
    }
  }
  console.log('Project created successfully!');
  return projectPath;
}

/**
 * Main function to parse arguments and run the create command.
 */
async function main() {
  try {
    let args = process.argv.slice(2);

    if (args.includes('-h') || args.includes('--help')) {
      console.log(USAGE_MESSAGE);
      process.exit(0);
    }

    const installArg = args.find((arg) => arg.startsWith('--install'));
    args = args.filter((arg) => !arg.startsWith('--install'));

    let packageManager = null;
    if (installArg) {
      const [, pm] = installArg.split('=');
      packageManager = pm || 'prompt';
    }

    if (args.length !== 2 || args[0] !== 'create' || !args[1]) {
      console.log(USAGE_MESSAGE);
      process.exit(0);
    }

    const targetDir = args[1];
    const projectPath = await createProject(targetDir);

    if (packageManager === 'prompt') {
      const availablePms = ['bun', 'pnpm', 'npm', 'yarn'].filter(
        isCommandInstalled
      );

      if (availablePms.length === 0) {
        console.warn(
          '\nWarning: No package managers (bun, pnpm, npm, yarn) found. Skipping dependency installation.'
        );
        process.exit(0);
      }

      const response = await prompts({
        type: 'select',
        name: 'pm',
        message: 'Which package manager do you want to use for installation?',
        choices: [
          ...availablePms.map((pm) => ({ title: pm, value: pm })),
          { title: 'None', value: null }
        ]
      });
      packageManager = response.pm;
    }

    await installDependencies(projectPath, packageManager);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
