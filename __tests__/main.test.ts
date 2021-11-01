import * as path from 'path'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import { expect, test } from '@jest/globals'

test('test debug build', async () => {
  const { stdout } = await getExecOutput({ debug: true })
  expect(stdout).toMatch(/configuration +Debug/)
  expect(stdout).not.toMatch(/configuration +Release/)
})

test('test release build', async () => {
  const { stdout } = await getExecOutput({ debug: false })
  expect(stdout).toMatch(/configuration +Release/)
  expect(stdout).not.toMatch(/configuration +Debug/)
})

test('test only platform specific packages', async () => {
  const { stdout } = await getExecOutput({ onlyPlatformSpecificPackages: true })
  expect(stdout).toMatch(/p:OnlyPackPlatformSpecificPackages=true/)
})

test('test nodejs build for debug builds', async () => {
  const { stdout } = await getExecOutput({ debug: true })
  expect(stdout).not.toMatch(/--no-build-nodejs/)
})

test('test nodejs build for release builds', async () => {
  const { stdout } = await getExecOutput({ debug: false })
  expect(stdout).toMatch(/--no-build-nodejs/)
})

interface NamedParameters {
  debug?: boolean,
  onlyPlatformSpecificPackages?: boolean
}

async function getExecOutput(parameters: NamedParameters): Promise<exec.ExecOutput> {
  const nodePath: string = await io.which('node', true)
  const mainPath = path.join(__dirname, '..', 'lib', 'main.js')
  return exec.getExecOutput(
    nodePath,
    [mainPath],
    getExecOptions(parameters))
}

function getExecOptions(parameters: NamedParameters): exec.ExecOptions {
  return {
    ...getEnv(parameters),
    cwd: path.join(__dirname, '..'),
    silent: false,
    failOnStdErr: false,
    ignoreReturnCode: false,
  }
}

function getEnv({ debug, onlyPlatformSpecificPackages: platformSpecific }: NamedParameters) {
  return {
    env: {
      ...getDebugEnv(debug),
      ...getPlatformSpecificEnv(platformSpecific)
    }
  }
}

function getDebugEnv(debug?: boolean) {
  return { 'INPUT_DEBUG': debug?.toString() || 'true' }
}

function getPlatformSpecificEnv(platformSpecific?: boolean) {
  return { 'INPUT_ONLY_PACK_PLATFORM_SPECIFIC_PACKAGES': platformSpecific?.toString() || 'true' }
}