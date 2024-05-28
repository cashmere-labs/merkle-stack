// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

/// ============ Imports ============
import { ERC20 } from "../lib/solmate/src/tokens/ERC20.sol"; // Solmate: ERC20;
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"; // OZ: MerkleProof

/// @title MerkleClaimERC20
/// @notice Non-transferrable ERC20 claimable by members of a merkle tree
contract MerkleClaimERC20 {
    /// ============ Immutable storage ============

    /// @notice ERC20-claimee inclusion root
    bytes32 public immutable merkleRoot;

    /// @notice ERC20 token contract
    ERC20 public immutable token;

    /// ============ Mutable storage ============

    /// @notice Mapping of addresses who have claimed tokens
    mapping(address => bool) public hasClaimed;

    /// ============ Errors ============

    /// @notice Thrown if address has already claimed
    error AlreadyClaimed();
    /// @notice Thrown if address/amount are not part of Merkle tree
    error NotInMerkle();

    /// ============ Constructor ============

    /// @notice Creates a new MerkleClaimERC20 contract
    /// @param _token ERC20 token contract
    /// @param _merkleRoot of claimees
    constructor(ERC20 _token, bytes32 _merkleRoot) {
        token = _token;
        merkleRoot = _merkleRoot; // Update root
    }

    /// ============ Events ============

    /// @notice Emitted after a successful token claim
    /// @param to recipient of claim
    /// @param amount of tokens claimed
    event Claim(address indexed to, uint256 amount);

    /// ============ Functions ============

    /// @notice Allows claiming tokens if address is part of merkle tree
    /// @param amount of tokens owed to claimee
    /// @param proof merkle proof to prove address and amount are in tree
    function claim(uint256 amount, bytes32[] calldata proof) external {
        address to = msg.sender; // Use the transaction executor's address

        // Throw if address has already claimed tokens
        if (hasClaimed[to]) revert AlreadyClaimed();

        // Verify merkle proof, or revert if not in tree
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(to, amount)))
        );
        bool isValidLeaf = MerkleProof.verify(proof, merkleRoot, leaf);
        if (!isValidLeaf) revert NotInMerkle();

        // Set address to claimed
        hasClaimed[to] = true;

        // Transfer tokens from contract to address
        require(
            token.balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );
        require(token.transfer(to, amount), "Transfer failed");

        // Emit claim event
        emit Claim(to, amount);
    }
}
