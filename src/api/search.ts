import { AppEnv } from '../app-env';
import { AddressInfo, BlockInfo, TransactionInfo } from '~api/types';

export const searchRequest = async (term: string, handler: SearchSwitch) => {
  let result: Response | null = null;

  try {
    result = await fetch(`${AppEnv.DAG_EXPLORER_API}/search/${term}`);
  } catch (e) {
    result = null;
  }

  if (result && result.status !== 404) {
    const search: Search = await result.json();

    if (search.type === SearchType.ADDRESS) {
      search.result.balance = search.result.balance || createEmptyAddress();
      handler.onAddress(search.result);
    } else if (search.type === SearchType.BLOCK) {
      handler.onBlock(search.result);
    } else {
      handler.onTx(search.result);
    }
  } else {
    handler.onNotFound();
  }
};

type SearchSwitch = {
  onTx: (tx: TransactionResult) => void;
  onBlock: (block: BlockResult) => void;
  onAddress: (account: AddressResult) => void;
  onNotFound: () => void;
};

type TransactionResult = TransactionInfo;

type BlockResult = {
  block: BlockInfo;
  txs: TransactionInfo[];
};

type AddressResult = {
  balance: AddressInfo;
  txs: TransactionInfo[];
};

type Search = SearchResultsAddress | SearchResultsBlock | SearchResultsTx;

enum SearchType {
  TX = 'TX',
  BLOCK = 'BLOCK',
  ADDRESS = 'ADDRESS'
}

type SearchResultsAddress = {
  type: SearchType.ADDRESS;
  result: AddressResult;
};

type SearchResultsBlock = {
  type: SearchType.BLOCK;
  result: BlockResult;
};

type SearchResultsTx = {
  type: SearchType.TX;
  result: TransactionResult;
};

function createEmptyAddress() {
  return {
    balance: 0
  };
}
