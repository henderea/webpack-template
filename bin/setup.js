#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const jsdiff = require('diff');
const chalk = require('chalk');
const inquirer = require('inquirer');

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

function confirmSave() {
    var p = inquirer.createPromptModule();
    return p({
        type: 'confirm',
        name: 'save',
        message: 'Save the changes?',
        default: false
    }).then(answers => answers.save);
}

var prompt = inquirer.createPromptModule();
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
        default: '#000000'
    },
    {
        name: 'siteBackgroundColor',
        type: 'input',
        message: 'Site Background Color to go in manifest.json',
        default: '#ffffff'
    },
    {
        name: 'siteDisplay',
        type: 'input',
        message: 'Site Display type to go in manifest.json',
        default: 'minimal-ui'
    }
];

prompt(questions).then(answers => {
    let packageJsonSrc = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
    let manifestJsonSrc = fs.readFileSync(path.join(__dirname, '../public/manifest.json'), 'utf8');
    let packageJson = JSON.parse(packageJsonSrc);
    let manifestJson = JSON.parse(manifestJsonSrc);
    packageJson.name = answers.baseName;
    packageJson.description = answers.desc;
    if(answers.addDeploy) {
        packageJson.scripts.deploy = `vercel --prod`;
    }
    if(answers.repo && answers.repo != '') {
        packageJson.repository = answers.repo;
    } else {
        packageJson.repository = '';
    }
    manifestJson.name = answers.siteName || answers.baseName;
    manifestJson.short_name = answers.siteShortName || manifestJson.name;
    manifestJson.theme_color = answers.siteThemeColor || '#000000';
    manifestJson.background_color = answers.siteBackgroundColor || '#ffffff';
    manifestJson.display = answers.siteDisplay || 'minimal-ui';
    let packageJsonDest = JSON.stringify(packageJson, null, 2);
    let manifestJsonDest = JSON.stringify(manifestJson, null, 2);
    showDiff(packageJsonSrc, packageJsonDest, 'package.json');
    confirmSave().then(save => {
        if(save) {
            fs.writeFileSync(path.join(__dirname, '../package.json'), packageJsonDest);
        }
        showDiff(manifestJsonSrc, manifestJsonDest, 'manifest.json');
        confirmSave().then(save => {
            if(save) {
                fs.writeFileSync(path.join(__dirname, '../public/manifest.json'), manifestJsonDest);
            }
        });
    });
});