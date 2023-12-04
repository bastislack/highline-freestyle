// Run using npx vite-node ./scripts/createPrForSheetsIfNeeded.ts
// or TARGET_REPOSITORY="..." npx vite-node ./scripts/createPrForSheetsIfNeeded.ts
import { unlink, writeFile } from 'fs/promises';
import { exit } from 'process';
import { $, chalk } from 'zx';

const repository = process.env['TARGET_REPOSITORY']
  ? process.env['TARGET_REPOSITORY']
  : 'bastislack/highline-freestyle';
const mainRemoteBranch = process.env['TARGET_HEAD_REF']
  ? process.env['TARGET_HEAD_REF']
  : 'origin/rewrite';

function parseDiffOutput(output: string) {
  function getOperations(operation: string) {
    switch (operation) {
      case 'M':
        return 'Modified';
      case 'R':
        return 'Renamed';
      case 'D':
        return 'Deleted';
      case 'A':
        return 'Added';
      default:
        throw new Error('Unexpected Git Diff Operation: ' + operation);
    }
  }

  return output
    .split('\n')
    .filter((e) => e.trim().length > 0)
    .map((e) => {
      const [operation, file] = e.split('\t');
      return { operation: getOperations(operation[0]), file };
    });
}

// Tries to find a Pull Requests with "automatic", "sheet-update" Tags that belongs has its HEAD on the current branch.
async function findPr() {
  const currentBranch = await $`git rev-parse --abbrev-ref HEAD`.quiet();
  const jsonResponseShell =
    await $`gh search  prs --repo=${repository} --label automatic,sheets-update --state open --json url,title,body --head ${currentBranch}`;
  const response = JSON.parse(jsonResponseShell.stdout) as {
    url: string;
    title: string;
    body: string;
  }[];
  if (response.length === 0) {
    return undefined;
  }
  if (response.length > 1) {
    throw new Error(
      'More than one Automated open PR found! This should never happen. Please manually close the wrong PRs and retry.'
    );
  }
  // There should never ever be more than 1 active PR
  return response[0];
}

async function createOrPutPr(
  globalDiff: { operation: string; file: string }[],
  localDiff: { operation: string; file: string }[],
  urlToAlreadyPresentPr?: string | undefined
) {
  const body = `
  **This action is performed automatically by a Github Action**

  There are ${
    globalDiff.length
  } changes to the YAML files between the Google Sheet and the base-Branch:
  \`\`\`
  ${globalDiff.map((e) => `File ${e.file} was ${e.operation.toLocaleLowerCase()}`).join('\n')}
  \`\`\`

  If something is wrong in these Tricks, **do not change them in the code here**. Fix them in the Google Sheet instead.
  `
    .split('\n')
    .map((e) => e.trim())
    .join('\n');
  await writeFile('.body', body, 'utf-8');

  if (urlToAlreadyPresentPr) {
    const localDiffText = localDiff
      .map((e) => `- File \`${e.file}\` was ${e.operation.toLocaleLowerCase()}`)
      .join('\n');

    // PR exists. We replace the Body and add a comment with the local changes
    await $`gh pr edit ${urlToAlreadyPresentPr} --body-file .body`;
    await writeFile(
      '.comment',
      `Since the last time this action was run the following changes have occured: \n${localDiffText}`,
      'utf-8'
    );
    await $`gh pr comment ${urlToAlreadyPresentPr} --body-file .comment`;
    await unlink('.comment');
    await unlink('.body');

    return;
  }

  // if here: PR does not exist. We have to create it.
  const branch = mainRemoteBranch.split('/').filter((_, i) => i > 0);
  await $`gh pr create --title 'chore(sheet): Sync YAML Definitions for Tricks and Combos from Google Sheets'  --body-file .body --base ${branch} --label automatic,sheets-update --head chore/sheets`;
  await unlink('.body');
  console.log(chalk.green('A new PR has been created'));
}

const alreadyExistingPrData = await findPr();
console.log(
  'Does PR already exist? ',
  alreadyExistingPrData ? chalk.green('yes') : chalk.red('no')
);
console.log(chalk.blue('Looking for changes to base commit:'));

const globalDiff = parseDiffOutput(
  (await $`git diff ${mainRemoteBranch} --name-status`.quiet()).stdout
).filter(
  // We only care about data-Changes. There *shouldnt* be any other changes, but hey.. you never know :P
  (e) => e.file.startsWith('src/data')
);
console.log(globalDiff);

if (globalDiff.length === 0) {
  console.log(chalk.blue(`Base branch ${mainRemoteBranch} is in sync. There are no changes.`));
  if (alreadyExistingPrData) {
    // PR exists and needs to be closed
    await $`gh pr close ${alreadyExistingPrData.url} -c "PR was closed as there is no longer a difference between Sheets and Repository. (this action was performed automatically)"`;
  }
  exit(0);
}

console.log(chalk.blue('Looking for changes since last detection:'));

// This checks the currently staged files.
const localDiff = parseDiffOutput((await $`git diff --name-status HEAD`).stdout).filter(
  // We only care about data-Changes. There *shouldnt* be any other changes, but hey.. you never know :P
  (e) => e.file.startsWith('src/data')
);
console.log(localDiff);

if (localDiff.length === 0) {
  console.log(chalk.blue(`Head Branch is in sync. There are no local changes.`));

  if (!alreadyExistingPrData) {
    console.log(
      chalk.yellow(`Could not find a PR for the already present changed. Creating one...`)
    );
    await createOrPutPr(globalDiff, localDiff);
  }

  exit(0);
}

console.log(chalk.yellow(`Base Branch is out of sync. A commit is being prepared.`));

await $`git commit -m "chore(sheet): Sync YAML Definitions for Tricks and Combos from Google Sheets"`;
try {
  await $`git push --set-upstream origin chore/sheets`;
} catch (_) {
  await $`git push --force --set-upstream origin chore/sheets`;
}
console.log(chalk.blue('Commited and pushed update. Creating PR...'));

await createOrPutPr(globalDiff, localDiff, alreadyExistingPrData?.url);
