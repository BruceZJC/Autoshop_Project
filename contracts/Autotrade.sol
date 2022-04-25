pragma solidity ^0.5.0;

contract Autotrade {
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
    uint[carCount] public arrayForItems;
	uint public itemId = 0;
    mapping(uint => Item) public vehicles; // item hash table
    mapping(uint => address) public highestBidders; // highest bidders hash table 
    event BidEvent(uint _itemId, uint indexed _bidAmt); // Declaring events which help us use ethereum's logging facility

    
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
    function addItem (string memory vehicle_brand, string memory vehicle_model, string memory description, uint buy_now_price, uint starting_price, uint min_incr, uint offer_price) public { 	
		vehicles[itemId] = Item(vehicle_brand, vehicle_model, description, buy_now_price, starting_price, min_incr, offer_price);
		highestBidders[itemId] = address(0);
		itemId ++;
	}

    function buyNow(uint vehicleId) public returns (uint){
     require(vehicleId >= 0 && vehicleId <=15); // use require() to make sure ID is in range.
     buyers[vehicleId] = msg.sender; // mes.sender is the person called this function
     return vehicleId; // send petId back as confirmation
     }

    function getBuyers() public view returns (address[16] memory){
     // memory gives the data loation for the variable, "adopers" is in memory
     return buyers;
    }

    function getItemCount () public pure returns (uint) {
		return carCount;
	}
	

	// Function to get the name of an item using its item id
	function getItemName (uint _itemId) public view returns (string memory) {
		require(_itemId >= 0 && _itemId < carCount, "Item does not exist"); // the item id must be greater than 0 but less or equal to the total count

		return vehicles[_itemId].vehicle_model;
	}


	// Function to get the highest current price of an item using its item id
	function getItemPrice (uint _itemId) public view returns (uint) {
		require(_itemId >= 0 && _itemId < carCount, "Item does not exist"); // the item id must be greater than 0 but less or equal to the total count
		return vehicles[_itemId].offer_price;
	}
	

	// Function to get the min_increment of an item using its item id
	function getItemIncrement (uint _itemId) public view returns (uint) {
		require(_itemId >= 0 && _itemId < carCount, "Item does not exist"); // the item id must be greater than 0 but less or equal to the total count

		return vehicles[_itemId].min_incr;
	}

    function getPercentIncrease (uint _itemId) public view returns (uint) {
		uint auctionPrice = vehicles[_itemId].offer_price;
		uint basePrice = vehicles[_itemId].starting_price;
		uint percentIncrease = (auctionPrice - basePrice)*100/basePrice;

		return percentIncrease;
	}

  // Function to place a bid
    function placeOffer (uint _itemId, uint _bidAmt) public returns (uint) {
        // Requirements 
		require(_itemId >= 0 && _itemId < carCount, "Bidding on an invalid item"); // the item id must be greater than 0 but less than the total count
		
		require(check_bid (_itemId, _bidAmt),"Bid is lower or equal to the highest bid value"); // the bid should be higher or equal to the current
		
		require(check_increment (_itemId, _bidAmt),"Bid is not enough based on minimum increment"); // make sure that the increment is greater than or equal to the minimum increment for the auction item

		require(check_highest_bidder(_itemId, msg.sender), "Person bidding is the highest bidder"); // make sure that person bidding isn't already highest bidder

        vehicles[_itemId].offer_price = _bidAmt; // replace the current price with the new bid amount
		highestBidders[_itemId] = msg.sender; // replace the highest bidder for that item id with the new highest bidder

		emit BidEvent(_itemId, _bidAmt); // logs the bid event on ethereum EVM

        return _itemId; // return the item back 	
    }


    // Function to check if the bid is greater than highest bid
	function check_bid (uint _itemId, uint _bidAmt) public view returns (bool) {
		if (_bidAmt > vehicles[_itemId].offer_price) return true;
		else return false;
	}
	
	
    // Function to check if the difference is greater to minimum increment value
	function check_increment (uint _itemId, uint _bidAmt) public view returns (bool) {
		uint diff;
		diff = _bidAmt - vehicles[_itemId].offer_price;
		if (diff >= vehicles[_itemId].min_incr) return true;
		else return false;
	}
	

	// Function to check if person bidding is the highest bidder
	function check_highest_bidder (uint _itemId, address person_wallet) public view returns (bool) {
		if (person_wallet == highestBidders[_itemId]) {
			return false;
		} else {
			return true;
		}
	}

	// Function to get array of prices of all items in auction as an array
	function getAllPrices() public view returns (uint[carCount] memory) {
        uint[carCount] memory result;
        for (uint i=0;i < carCount; i++) {
            result[i] = this.getItemPrice(i);
        }
		return result;
	}


	// Function to get array of increase in percentages of all items in auction as an array
	function getAllIncrease () public view returns (uint[carCount] memory) {
		uint[carCount] memory result;
        for (uint i=0;i < carCount; i++) {
            result[i] = this.getPercentIncrease(i);
        }
		return result;
	}


	// Function to get array of increments of all items in auction as an array
	function getAllIncreament () public view returns (uint[carCount] memory) {
		uint[carCount] memory result;
        for (uint i=0;i < carCount; i++) {
            result[i] = this.getItemIncrement(i);
        }
		return result;
	}

}
