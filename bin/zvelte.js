#!/usr/bin/env node

import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import prompts from 'prompts';

const REPO_URL = 'https://github.com/Queaxtra/sveltekit-shadcn-template.git';
const USAGE_MESSAGE = `Usage: bunx @queaxtra/zvelte <command> [options]\n\nCommands:\n  create <project-directory>  Creates a new SvelteKit project using a predefined template.\n\nArguments:\n  <project-directory>  The directory for the new project.\n                       Use '.' to use the current directory.\n\nOptions:\n  --install[=<pm>]     Installs dependencies using the specified package manager (bun, pnpm, npm, yarn).\n                       If no package manager is specified, you will be prompted to choose.\n  -h, --help           Displays this help message.\n\nExamples:\n  bunx @queaxtra/zvelte create my-awesome-project --install=bun
`;

/**
 * Checks if a command is available on the system.
 * @param {string} command - The command to check.
 * @returns {boolean} True if the command is installed, false otherwise.
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
 * @returns {Promise<void>} Resolves when cloning is complete.
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
 * @returns {Promise<void>} Resolves when installation is complete.
 */
async function installDependencies(projectPath, packageManager) {
  if (!packageManager) {
    return;
  }

  if (!isCommandInstalled(packageManager)) {
    console.warn(
      `\x1b[33mWarning: ${packageManager} is not installed. Skipping dependency installation.\x1b[0m`
    );
    return;
  }

  console.log(
    `\x1b[34mInstalling dependencies with ${packageManager}...\x1b[0m`
  );
  return new Promise((resolve, reject) => {
    const installProcess = spawn(packageManager, ['install'], {
      cwd: projectPath,
      stdio: 'inherit'
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n\x1b[32mDependencies installed successfully!\x1b[0m');
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
 * Validates the target directory for security.
 * @param {string} targetDir - The target directory to validate.
 * @returns {string} The resolved and validated path.
 * @throws {Error} If the directory is invalid or path traversal is detected.
 */
function validateTargetDir(targetDir) {
  if (!targetDir || typeof targetDir !== 'string') {
    throw new Error('Invalid project directory provided.');
  }

  const resolvedPath = path.resolve(process.cwd(), targetDir);
  const normalizedPath = path.normalize(resolvedPath);

  if (normalizedPath !== resolvedPath) {
    throw new Error('Path traversal detected in project directory.');
  }

  return resolvedPath;
}

/**
 * Handles merging template into the current non-empty directory.
 * @param {string} projectPath - The project path.
 * @param {string} tempDir - The temporary directory for cloning.
 * @returns {Promise<void>} Resolves when merge is complete.
 * @throws {Error} If conflicting files are found.
 */
async function handleCurrentDirMerge(projectPath, tempDir) {
  console.log(
    '\x1b[34mCloning template repository into a temporary directory...\x1b[0m'
  );
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

  console.log('\x1b[34mCopying project files...\x1b[0m');

  for (const file of templateFiles) {
    fs.cpSync(path.join(tempDir, file), path.join(projectPath, file), {
      recursive: true
    });
  }

  console.log(
    '\x1b[32mProject successfully initialized in the current directory.\x1b[0m'
  );
}

/**
 * Handles creation of a new project in an empty directory.
 * @param {string} projectPath - The project path.
 * @returns {Promise<void>} Resolves when project is created.
 */
async function handleNewProjectCreation(projectPath) {
  console.log(`\x1b[34mCreating new project in ${projectPath}...\x1b[0m`);
  await cloneRepository(projectPath);
  const gitPath = path.join(projectPath, '.git');

  if (fs.existsSync(gitPath)) {
    try {
      fs.rmSync(gitPath, { recursive: true, force: true });
      console.log('\x1b[32mRemoved .git directory.\x1b[0m');
    } catch (error) {
      console.error(
        `\x1b[31mFailed to remove .git directory: ${error.message}\x1b[0m`
      );
      throw error;
    }
  }
  console.log('\x1b[32mProject created successfully!\x1b[0m');
}

/**
 * Creates a new project by cloning a template.
 * @param {string} targetDir - The target directory for the project.
 * @returns {Promise<string>} The absolute path to the project.
 * @throws {Error} If the target directory is invalid or conflicts exist.
 */
async function createProject(targetDir) {
  const projectPath = validateTargetDir(targetDir);
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
      await handleCurrentDirMerge(projectPath, tempDir);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    return projectPath;
  }

  await handleNewProjectCreation(projectPath);
  return projectPath;
}

/**
 * Updates the package.json file with project-specific details.
 * @param {string} projectPath - The project path.
 */
function updatePackageJson(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const projectName = path.basename(projectPath);
  packageJson.name = projectName;
  packageJson.description = '';
  packageJson.version = '0.0.1';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

/**
 * Prompts the user to select a package manager.
 * @returns {Promise<string | null>} The selected package manager or null.
 */
async function promptPackageManager() {
  const availablePms = ['bun', 'pnpm', 'npm', 'yarn'].filter(
    isCommandInstalled
  );

  if (availablePms.length === 0) {
    console.warn(
      '\n\x1b[33mWarning: No package managers (bun, pnpm, npm, yarn) found. Skipping dependency installation.\x1b[0m'
    );
    return null;
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
  return response.pm;
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

    const command = args[0];

    if (command === 'create') {
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

      updatePackageJson(projectPath);

      if (packageManager === 'prompt') {
        packageManager = await promptPackageManager();
      }

      await installDependencies(projectPath, packageManager);
      process.exit(0);
    }

    if (command !== 'create') {
      console.log(USAGE_MESSAGE);
      process.exit(0);
    }
  } catch (error) {
    console.error(`\x1b[31mError: ${error.message}\x1b[0m`);
    process.exit(1);
  }
}

main();
