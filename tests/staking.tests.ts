import {network, patract} from "redspot";
import BN from "bn.js";
import {expect} from "chai";

const { api, getAddresses } = network;
const { getContractFactory, getRandomSigner } = patract

export const setupContract = async (name, constructor, ...args) => {
  const one = new BN(10).pow(new BN(api.registry.chainDecimals[0]))
  const signers = await getAddresses()
  const defaultSigner = await getRandomSigner(signers[0], one.muln(10000))
  const contractFactory = await getContractFactory(name, defaultSigner.address)
  const contract = await contractFactory.deploy(constructor, ...args)

  return {
    defaultSigner,
    contract,
    query: contract.query,
    tx: contract.tx
  }
}

describe('Staking', async () => {

  it('Should not "withdraw" funds if a day has not passed', async () => {
    const staking = await setupContract('staking', 'new')
    await staking.tx.claim(1000)
    const funds = await staking.query.withdraw()

    expect(funds).to.have.property('output').to.equal(null)
  })

  it('Should allow to "withdraw" after one day - mock timestamp version', async () => {
    const staking = await setupContract('staking_mock', 'new')
    await staking.tx.claim(1000)

    const nextTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000
    await staking.tx.setTimestamp(nextTimestamp) // THIS could be omitted - see the next test

    const withdrawn = await staking.query.withdraw()
    // @ts-ignore
    expect(+withdrawn.output?.toJSON()).to.equal(1000)
  })

  // the test is skipped because it fails
  it.skip('Should allow to "withdraw" after one day - polkadot.js api version', async () => {
    const staking = await setupContract('staking', 'new')
    await staking.tx.claim(1000)

    const nextTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000
    // how to execute this extrinsic with 'inherent' origin?
    await api.tx.timestamp.set(nextTimestamp).signAndSend(staking.defaultSigner.pair)

    const withdrawn = await staking.query.withdraw()
    // @ts-ignore
    expect(+withdrawn.output?.toJSON()).to.equal(1000)
  })

})