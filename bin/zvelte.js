#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const REPO_URL = 'https://github.com/Queaxtra/sveltekit-shadcn-template.git';
const USAGE_MESSAGE = 'Usage: npx @queaxtra/zvelte create <project-directory>';

async function cloneRepository(projectPath) {
  console.log(`Cloning ${REPO_URL} into ${projectPath}...`);

  return new Promise((resolve, reject) => {
    const gitProcess = spawn('git', ['clone', REPO_URL, projectPath], {
      stdio: 'inherit'
    });

    gitProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Project created successfully!');
        resolve();
      } else {
        console.error(`Git clone failed with code ${code}`);
        reject(new Error(`Git clone failed with code ${code}`));
      }
    });
  });
}

async function createProject(targetDir) {
  const projectPath = path.resolve(process.cwd(), targetDir);

  if (fs.existsSync(projectPath) && fs.readdirSync(projectPath).length > 0) {
    throw new Error(`Directory '${targetDir}' is not empty.`);
  }

  await cloneRepository(projectPath);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 2 || args[0] !== 'create' || !args[1]) {
    console.log(USAGE_MESSAGE);
    process.exit(0);
  }

  const command = args[0];
  const targetDir = args[1];

  try {
    if (command === 'create') {
      await createProject(targetDir);
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
