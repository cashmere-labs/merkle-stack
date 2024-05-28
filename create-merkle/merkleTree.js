import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";


// (1)
const data = JSON.parse(fs.readFileSync("data/airdrop_data.json", "utf8"));


// (2)
const tree = StandardMerkleTree.of(data, ["address", "uint256"]);

// (3)
console.log('Merkle Root:', tree.root);

// (4)
fs.writeFileSync("data/tree/tree.json", JSON.stringify(tree.dump()));