pragma solidity ^0.5.0;

contract Adoption {
    struct Item{			
        string vehicle_brand; // vehicle's brand
		string vehicle_model; // which specific model is this vehicle
        string description; // information about a vehicle, e.g. production year, mileage
        uint buy_now_price;
		uint starting_price; // starting price
		uint min_incr; // minimum increment for a bid
		uint offer_price;  // current price of item
	}

    address[16] public buyers; // array of ethereum addresses
    uint constant carCount = 10;
    uint public numOfPurchases = 0;
    uint[carCount] public arrayForItems;
	uint public itemId = 0;
    mapping(uint => Item) public vehicles; // item hash table
    mapping(uint => address) public highestOfferers; // highest bidders hash table 
    event offerPlacement(uint _vehicleId, uint indexed _offerAmount); // Declaring events which help us use ethereum's logging facility

    function addItem (string memory vehicle_brand, string memory vehicle_model, string memory description, uint buy_now_price, uint starting_price, uint min_incr, uint offer_price) public { 	
		vehicles[itemId] = Item(vehicle_brand, vehicle_model, description, buy_now_price, starting_price, min_incr, offer_price);
		highestOfferers[itemId] = address(0);
		itemId ++;
	}
    
    constructor() public {	
		addItem("BMW", "M2", "need info here", 40, 20, 2, 20);
		addItem("Mercedes", "GTR", "need info here", 400, 200, 20, 200);
		addItem("Honda", "Civic Type-R", "need info here", 300, 150, 35, 150);
		addItem("Volkswagen", "Golf gti", "need info here", 300, 150, 35, 150);
        addItem("BMW", "M3", "need info here", 40, 20, 2, 20);
		addItem("Mercedes", "c63", "need info here", 400, 200, 20, 200);
		addItem("Honda", "s2000", "need info here", 300, 150, 35, 150);
		addItem("Volkswagen", "Golf r", "need info here", 300, 150, 35, 150);
        addItem("Ford", "f150", "need info here", 300, 150, 35, 150);
        addItem("Ram", "1500", "need info here", 300, 150, 35, 150);
	}
    
    // Adopting a pet
    function adopt(uint petId) public returns (uint) {
        require(petId >= 0 && petId <= 15);
        buyers[petId] = msg.sender;
        numOfPurchases = numOfPurchases +1;
        return petId;
        }
    // Retrieving the adopters
    function getAdopters() public view returns (address[16] memory) {
        return buyers;
    }

    function getNumOfPurchase() public view returns (uint){
        return numOfPurchases;
    }

    function getItemPrice (uint _itemId) public view returns (uint) {
		require(_itemId >= 0 && _itemId < carCount, "Item does not exist"); // the item id must be greater than 0 but less or equal to the total count
		return vehicles[_itemId].offer_price;
	}

    function getAllPrices() public view returns (uint[carCount] memory) {
        uint[carCount] memory result;
        for (uint i=0;i < carCount; i++) {
            result[i] = this.getItemPrice(i);
        }
		return result;
	}

    function getHighestOfferer() public view returns (address[carCount] memory) {
		address[carCount] memory arrayOfBidders;
		for (uint i=0;i < carCount; i++) {
			arrayOfBidders[i] = highestOfferers[i];
		}
		return arrayOfBidders;

	}


    function placeNewOffer (uint _vehicleId, uint _offerAmount) public returns (uint) {
        // Requirements 
		require(_vehicleId >= 0 && _vehicleId < carCount, "Item trying to play new offer on is invalid"); 	
		require(check_offer_high_enough (_vehicleId, _offerAmount),"New Offer is lower or equal to the highest bid value");
		require(check_highest_bidder(_vehicleId, msg.sender), "Person bidding is the highest bidder");

        vehicles[_vehicleId].offer_price = _offerAmount; 
		highestOfferers[_vehicleId] = msg.sender;

		emit offerPlacement(_vehicleId, _offerAmount); 

        return _vehicleId; // return the item back 	

    }

	function check_offer_high_enough (uint _vehicleId, uint _offerAmount) public view returns (bool) {
		if (_offerAmount > vehicles[_vehicleId].offer_price) return true;
		else return false;
	}
	
	function check_highest_bidder (uint _vehicleId, address _wallet) public view returns (bool) {
		if (_wallet == highestOfferers[_vehicleId]) {
			return false;
		} else {
			return true;
		}
	}

}
