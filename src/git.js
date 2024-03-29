import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

function cleanStdout(stdout) {
  return stdout.trim().split('\n').filter(Boolean)
}

export async function getChangedFiles() {
  const { stdout } = await execAsync('git status --porcelain')
  return cleanStdout(stdout).map(line => line.split(' ').at(-1))
}

export async function getStagedFiles() {
  console.log('HOLA MUNDO')
  const { stdout } = await execAsync('git diff --cached --name-only')
  return cleanStdout(stdout)
}

export async function gitCommit({ commit } = {}) {
  const { stdout } = await execAsync(`git commit -m "${commit}"`)
  return cleanStdout(stdout)
}

export async function gitAdd({ files = [] } = {}) {
  const filesLine = files.join(' ')
  const { stdout } = await execAsync(`git add ${filesLine}`)
  return cleanStdout(stdout)
}
export async function gitBranch() {
  const { stdout } = await execAsync('git branch')
  return cleanStdout(stdout)
}
export async function gitCheckout({ branch } = {}) {
  const { stdout } = await execAsync(`git checkout ${branch}`)
  return cleanStdout(stdout)
}
export async function gitPushOrigin({ branch } = {}) {
  const { stdout } = await execAsync(`git push origin ${branch}`)
  console.log(stdout)
  return cleanStdout(stdout)
}
