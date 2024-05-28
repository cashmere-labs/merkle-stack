// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.19;

import { ERC20 } from "../lib/solmate/src/tokens/ERC20.sol"; // Solmate: ERC20;

contract GoatPoint is ERC20 {
    mapping(address => bool) public whitelist;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initialSupply
    ) ERC20(_name, _symbol, _decimals) {
        _mint(msg.sender, _initialSupply);
        owner = msg.sender;
        whitelist[msg.sender] = true; 
    }

    function addToWhitelist(address _address) external onlyOwner {
        whitelist[_address] = true;
    }

    function removeFromWhitelist(address _address) external onlyOwner {
        whitelist[_address] = false;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(whitelist[msg.sender], "Only whitelisted addresses can transfer tokens");
        return super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        require(whitelist[sender], "Only whitelisted addresses can transfer tokens");
        return super.transferFrom(sender, recipient, amount);
    }
}