import { Token } from "../../api/tokens";

export type TokenBalanced = Token & { balance?: number };

export interface TokensState {
  tokens: TokenBalanced[];
  displayList: TokenBalanced[];
  totalTokens: TokenBalanced[];
}
