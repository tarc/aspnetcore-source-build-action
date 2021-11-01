import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as stream from 'stream'

async function run(): Promise<void> {
  try {
    const debugBuild: boolean = core.getBooleanInput('debug')
    const configuration = debugBuild ? 'Debug' : 'Release'

    let buildNodeJs: string[] = []

    if (!debugBuild) {
      buildNodeJs = ['--no-build-nodejs']
    }

    const platformSpecific: boolean = core.getBooleanInput(
      'only_pack_platform_specific_packages'
    )

    const test: boolean = core.getBooleanInput('test')

    let testOption: string[] = []

    if (!test) {
      testOption = ['--no-test']
    }

    const buildArgs = [
      '-configuration',
      configuration,
      ...buildNodeJs,
      ...testOption,
      '-ci',
      '--pack',
      '--all',
      '--no-build-java',
      `-p:OnlyPackPlatformSpecificPackages=${platformSpecific}`,
      '-bl:artifacts/log/build.macos.binlog',
      '-p:AssetManifestFileName=aspnetcore-MacOS_x64.xml'
    ]

    let output = ''
    const options = {
      windowsVerbatimArguments: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString()
        }
      }
    }

    await exec.exec('./build.sh', buildArgs, options)

    core.setOutput('stdout', output)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export class StringStream extends stream.Writable {
  constructor() {
    super()
    stream.Writable.call(this)
  }

  private contents = ''

  _write(
    data: string | Buffer | Uint8Array,
    encoding: string,
    next: Function
  ): void {
    this.contents += data
    next()
  }

  getContents(): string {
    return this.contents
  }
}

run()
