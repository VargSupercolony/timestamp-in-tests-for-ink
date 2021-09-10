import { RedspotUserConfig } from 'redspot/types'
import '@redspot/patract'
import '@redspot/chai'
import '@redspot/gas-reporter'

export default {
  defaultNetwork: 'development',
  contract: {
    ink: {
      toolchain: 'nightly',
      sources: [
        './'
      ]
    }
  },
  networks: {
    development: {
      endpoint: 'ws://127.0.0.1:9944',
      gasLimit: '400000000000',
      explorerUrl: 'https://polkadot.js.org/apps/#/explorer/query/?rpc=ws://127.0.0.1:9944/'
    },
    substrate: {
      endpoint: 'ws://127.0.0.1:9944',
      gasLimit: '400000000000',
      accounts: ['//Alice']
    }
  },
  mocha: {
    timeout: 60000
  }
} as RedspotUserConfig
