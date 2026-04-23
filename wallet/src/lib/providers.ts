import { JsonRpcProvider, Network } from 'ethers'
import { CHAINS, type ChainKey } from './chains'

const cache = new Map<ChainKey, JsonRpcProvider>()

/**
 * Returns a cached JsonRpcProvider for the given chain.
 * Network is declared statically so ethers never round-trips eth_chainId.
 */
export function getProvider(chain: ChainKey): JsonRpcProvider {
  const cached = cache.get(chain)
  if (cached) return cached

  const info = CHAINS[chain]
  const network = Network.from({ name: info.key, chainId: info.chainId })
  const provider = new JsonRpcProvider(info.rpc, network, {
    staticNetwork: network,
  })
  cache.set(chain, provider)
  return provider
}
