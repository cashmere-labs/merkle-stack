import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenModule = buildModule("erc20deploy", (m) => {
  const token = m.contract("GoatPoint", ["Goatpoint", "GP", 18, "1000000000000000000000000"]);
  return { token };
});

const TokenOwnerModule = buildModule("claimContract", (m) => {
  const { token } = m.useModule(TokenModule);
  const claimContract = m.contract("MerkleClaimERC20", [token, "0x704f14c94c45c7fa3a40abca69ac7768b52cfc022d8cf7906f98bbea547d8586"]);
  m.call(token, "addToWhitelist", [claimContract]);
  return { claimContract };
});

export default TokenOwnerModule;