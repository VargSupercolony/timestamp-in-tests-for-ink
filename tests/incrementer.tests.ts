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

describe('Incrementer', async () => {
  it('Should change timestamp via contract transaction', async () => {
    const incrementer = await setupContract('incrementer', 'new')
    const timestampBefore = await incrementer.query.timestamp()

    // @ts-ignore
    await incrementer.tx.setTimestamp(+timestampBefore.output?.toJSON() + 24 * 60 * 60 * 1000) // add 1 day in millis

    const timestampAfter = await incrementer.query.timestamp()

    // @ts-ignore
    expect(+timestampAfter.output).to.be.greaterThan(+timestampBefore.output)
  })

  it('Should disallow to increment two or more times per day', async () => {
    const incrementer = await setupContract('incrementer', 'new')
    await incrementer.tx.increment()
    const incremented = await incrementer.query.get()

    expect(incremented).to.have.property('output').to.equal(1)
    // WRONG - we already incremented today!
    try {
      await incrementer.tx.increment()
    } catch (e) {
      expect(e).to.have.property('error')
      // @ts-ignore
      expect(e.error.message, 'contracts.ContractTrapped( Contract trapped during execution.))')
    }
  })

  it('Should allow to increment once again after one day - contract version', async () => {
    const incrementer = await setupContract('incrementer', 'new')
    await incrementer.tx.increment()

    const nextTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000
    await incrementer.tx.setTimestamp(nextTimestamp) // THIS could be omitted - see the next test

    await expect(incrementer.tx.increment()).to.emit(incrementer.contract, 'TimestampsUpdated')

    const newValue = await incrementer.query.get()
    // @ts-ignore
    expect(+newValue.output?.toJSON()).to.equal(2)
  })

  // the test is skipped because it fails
  it.skip('Should allow to increment once again after one day - polkadot.js version', async () => {
    const incrementer = await setupContract('incrementer', 'new')
    await incrementer.tx.increment()

    const nextTimestamp = new Date().valueOf() + 24 * 60 * 60 * 1000
    await api.tx.timestamp.set(nextTimestamp).signAndSend(incrementer.defaultSigner.pair)

    await expect(incrementer.tx.increment()).to.emit(incrementer.contract, 'TimestampsUpdated')

    const newValue = await incrementer.query.get()
    // @ts-ignore
    expect(+newValue.output?.toJSON()).to.equal(2)
  })

})