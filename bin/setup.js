#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const jsdiff = require('diff');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { spawnSync } = require('child_process');

const projName = path.basename(path.join(__dirname, '..'));

function showDiff(oldSrc, newSrc, name) {
  console.log(chalk.bold(name));
  const diff = jsdiff.diffLines(oldSrc, newSrc);
  const hasChanges = _.some(diff, part => part.added || part.removed);
  if(hasChanges) {
    console.log(_.compact(_.map(diff, (part) => {
      const color = part.added ? chalk.green : part.removed ? chalk.red : null;
      if(color) {
        return color(part.value.replace(/\n$/g, ''));
      } else {
        return null;
      }
    })).join('\n'));
  } else {
    console.log('No changes');
  }
}

async function confirmSave() {
  const p = inquirer.createPromptModule();
  const answers = await p({
    type: 'confirm',
    name: 'save',
    message: 'Save the changes?',
    default: false
  });
  return answers.save;
}

async function askConfirm(message, defaultValue = false) {
  const p = inquirer.createPromptModule();
  const answers = await p({
    type: 'confirm',
    name: 'resp',
    message,
    default: defaultValue
  });
  // noinspection JSUnresolvedVariable
  return answers.resp;
}

function c(name, value = name, short = name) {
  return {
    name,
    value,
    short
  };
}

const prompt = inquirer.createPromptModule();
const questions = [
  {
    name: 'baseName',
    type: 'input',
    message: 'Name to go in package.json',
    default: projName
  },
  {
    name: 'desc',
    type: 'input',
    message: 'Description to go in package.json'
  },
  {
    name: 'addDeploy',
    type: 'confirm',
    message: 'Add a "yarn deploy" command?',
    default: false
  },
  {
    name: 'repo',
    type: 'input',
    message: 'Repository url to go in package.json (optional)'
  },
  {
    name: 'siteName',
    type: 'input',
    message: 'Site Name to go in manifest.json (defaults to the package.json name)'
  },
  {
    name: 'siteShortName',
    type: 'input',
    message: 'Site Short Name to go in manifest.json (defaults to the site name)'
  },
  {
    name: 'siteThemeColor',
    type: 'input',
    message: 'Site Theme Color to go in manifest.json',
    default: '#000'
  },
  {
    name: 'siteBackgroundColor',
    type: 'input',
    message: 'Site Background Color to go in manifest.json',
    default: '#fff'
  },
  {
    name: 'siteDisplay',
    type: 'list',
    message: 'Site Display type to go in manifest.json',
    choices: [
      c('Minimal UI', 'minimal-ui'),
      c('Fullscreen', 'fullscreen'),
      c('Standalone', 'standalone'),
      c('Browser (Not recommended)', 'browser', 'Browser')
    ],
    default: 'minimal-ui'
  }
];

prompt(questions).then(async answers => {
  let packageJsonSrc = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
  let manifestJsonSrc = fs.readFileSync(path.join(__dirname, '../public/manifest.json'), 'utf8');
  let packageJson = JSON.parse(packageJsonSrc);
  let manifestJson = JSON.parse(manifestJsonSrc);
  packageJson.name = answers.baseName;
  packageJson.description = answers.desc;
  // noinspection JSUnresolvedVariable
  if(answers.addDeploy) {
    packageJson.scripts.deploy = `vercel --prod`;
  }
  // noinspection JSUnresolvedVariable
  if(answers.repo && answers.repo !== '') {
    packageJson.repository = answers.repo;
  } else {
    packageJson.repository = '';
  }
  manifestJson.name = answers.siteName || answers.baseName;
  // noinspection JSUnresolvedVariable
  manifestJson.short_name = answers.siteShortName || manifestJson.name;
  // noinspection JSUnresolvedVariable
  manifestJson.theme_color = answers.siteThemeColor || '#000';
  // noinspection JSUnresolvedVariable
  manifestJson.background_color = answers.siteBackgroundColor || '#fff';
  // noinspection JSUnresolvedVariable
  manifestJson.display = answers.siteDisplay || 'minimal-ui';
  let packageJsonDest = JSON.stringify(packageJson, null, 2);
  let manifestJsonDest = JSON.stringify(manifestJson, null, 2);
  showDiff(packageJsonSrc, packageJsonDest, 'package.json');
  if(await confirmSave()) {
    fs.writeFileSync(path.join(__dirname, '../package.json'), packageJsonDest);
  }
  showDiff(manifestJsonSrc, manifestJsonDest, 'manifest.json');
  if(await confirmSave()) {
    fs.writeFileSync(path.join(__dirname, '../public/manifest.json'), manifestJsonDest);
  }

  let useTs = await askConfirm('Use TypeScript?');
  if(useTs) {
    console.log(chalk.bold.blue('Switching to TypeScript'));
    fs.unlinkSync(path.join(__dirname, '../src/index.js'));
    fs.renameSync(path.join(__dirname, '../src/index-sample.ts'), path.join(__dirname, '../src/index.ts'));
  } else {
    console.log(chalk.bold.blue('Removing TypeScript files and dependencies'))
    console.log(`> yarn remove @types/jquery @types/lodash`);
    spawnSync('yarn', ['remove', '@types/jquery', '@types/lodash'], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    fs.unlinkSync(path.join(__dirname, '../src/index-sample.ts'));
    fs.unlinkSync(path.join(__dirname, '../tsconfig.json'));
    fs.unlinkSync(path.join(__dirname, '../ts-types/global.d.ts'));
    fs.rmdirSync(path.join(__dirname, '../ts-types'));
  }

  console.log(chalk.bold.blue('Cleaning Up'));
  const doneMsg = chalk.bold.green('Cleanup complete');
  console.log('> yarn remove chalk diff inquirer ');
  spawnSync('yarn', ['remove', 'chalk', 'diff', 'inquirer'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  fs.unlinkSync(path.join(__dirname, 'setup.js'));
  fs.rmdirSync(__dirname);
  console.log(doneMsg);
});