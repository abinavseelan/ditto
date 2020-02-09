import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process'; 

const promisifiedExec = promisify(exec);


export async function createWorkTree(branch: string) {
  const { stdout, stderr } = await promisifiedExec(
    `git worktree add ${branch}`,
    // TODO: Replace `cwd` with a scalable solution.
    { cwd: path.resolve(process.cwd(), '..', '..', '..', 'tmp') },
  );

  if (stderr) {
    console.log("===STDERR===");
    console.log(stderr);
    throw {
      type: 'STDERR',
      message: stderr,
    };
  }

  console.log("===STDOUT===");
  console.log(stdout);
}

export async function createDeploymentScript() {

}
