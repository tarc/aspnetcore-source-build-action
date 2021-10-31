import * as path from 'path'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import { expect, test } from '@jest/globals'

test('test debug build', async () => {
  const { stdout } = await getExecOutput({ debug: true })
  expect(stdout).toMatch(/-configuration +Debug/)
  expect(stdout).not.toMatch(/-configuration +Release/)
})

test('test release build', async () => {
  const { stdout } = await getExecOutput({ debug: false })
  expect(stdout).toMatch(/-configuration +Release/)
  expect(stdout).not.toMatch(/-configuration +Debug/)
})

interface NamedParameters {
  debug?: boolean
}

async function getExecOutput({ debug }: NamedParameters): Promise<exec.ExecOutput> {
  const nodePath: string = await io.which('node', true)
  const mainPath = path.join(__dirname, '..', 'lib', 'main.js')
  return exec.getExecOutput(
    nodePath,
    [mainPath],
    getExecOptions(debug))
}

function getExecOptions(debug?: boolean): exec.ExecOptions {
  return {
    ...getEnv(debug),
    cwd: path.join(__dirname, '..'),
    silent: false,
    failOnStdErr: false,
    ignoreReturnCode: false,
  }
}

function getEnv(debug?: boolean) {
  if (debug == undefined) {
    return {}
  }
  return {
    env: { 'INPUT_DEBUG': debug.toString() }
  }
}