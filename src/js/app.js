App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load art.
    $.getJSON('../cars.json', function(data) {
      var carRow = $('#carsRow');
      var carTemplate = $('#carTemplate');
      for (i = 0; i < data.length; i ++) {
        carTemplate.find('.panel-title').text(`Vehicle ${i+1}`); // auction number as title
        carTemplate.find('img').attr('src', data[i].picture); // image 
        carTemplate.find('.vehicle_brand').text(data[i].vehicle_brand); // name of item 
        carTemplate.find('.vehicle_model').text(data[i].vehicle_model); // name of item 
        carTemplate.find('.buy_now_price').text(`ETH ${data[i].buy_now_price}`); // name of item 
        carTemplate.find('.description').text(data[i].description); // decription of the item
        carTemplate.find('.min_incr').text(`ETH ${data[i].min_incr}`); // minimum increment
        carTemplate.find('.starting_price').text(`ETH ${data[i].starting_price}`); // base price

        // Creating identifier attributes for HTML elements
        carTemplate.find('.highest-bid').attr('data-id', data[i].id); // adding attribute to the highest bid so we can dynamically change it
        carTemplate.find('.btn-submit').attr('data-id', data[i].id); // adding attribute for submit so we can associate itemids to submit buttons
        carTemplate.find('.input-amount').attr('id',`input-amt-${data[i].id}`); // same as above for input amount
        carRow.append(carTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    /*
     *
     */
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' })
      } catch (error) {
        // User denied account access...
        console.error('User denied account access')
      }
    }
    // Legacy dapp browsers..., (if ethereum object does not exist)
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider
    }
    // If no injected web3 instance is detected, fall back to Ganache, our local provider
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545',
      )
    }
    web3 = new Web3(App.web3Provider)
    return App.initContract()
  },

  initContract: function () {
    /*
     * 
     */
    $.getJSON('Adoption.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var VehicleArtifact = data
      App.contracts.auto_trade = TruffleContract(VehicleArtifact)

      // Set the provider for our contract
      App.contracts.auto_trade.setProvider(App.web3Provider)
      //web3.eth.getCoinbase(function(err, account) {
      //  if (err === null) {
      //    App.account = account;
      //    $("#account").text(account);
      //  }
      //}
      //)

      // Use our contract to retrieve and mark the adopted pets
      return App.updateAuctionPrices()
    })
    return App.bindEvents()
  },

  bindEvents: function () {
    $(document).on('click', '.btn-buy', App.handlePurchase)
  },

  markPurchase: function () {
    var adoptionInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(petId, {from: account});
  }).then(function(result) {
    return App.markPurchase();
  }).catch(function(err) {
    console.log(err.message);
  });
});
  },

  handlePurchase: function (event) {
    event.preventDefault()
    var vehicleId = parseInt($(event.target).data('id'))

    var purchaseInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];

      App.contracts.auto_trade.deployed().then(function(instance) {
        purchaseInstance = instance;
            // Execute adopt as a transaction by sending account
        return purchaseInstance.pay_fullprice(vehicleId, {from: account});
      }).then(function(result) {
        return App.markPurchase();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },
  handleInputChanges: function(id, bidAmount){
    var account = App.account;
    var artId = id.split("-")[2];
    var highestBidder = $(document).find('.highest-bidder').eq(artId).text();
    var minIncrement = Number($(document).find('.min-incr').eq(artId).text().slice(1));
    var highestBid = Number($(document).find(`.highest-bid[data-id=${artId}]`).text().slice(1));
    

    if (account !==  highestBidder) {
      if (bidAmount >= highestBid+minIncrement){
        $(document).find(`.btn-submit[data-id=${artId}]`).prop('disabled',false);
      } else {
        $(document).find(`.btn-submit[data-id=${artId}]`).prop('disabled',true);
      }
    } else {
      $(document).find(`.btn-submit[data-id=${artId}]`).prop('disabled',true);
    }

},

// Function to update auction prices 
// Data obtained from deployed smart contract
updateAuctionPrices: function() {
  var auctionInstance;
  
  App.contracts.auto_trade.deployed().then(function(instance) {
    auctionInstance = instance; 

    return auctionInstance.getArrayOfPrices.call();
  }).then(function(result) {
      for (j=0; j < result.length; j++) {
        $(document).find('.highest-bid').eq(j).text(`$${result[j]}`);
      }
    }).then(function(result) {
      return App.updateAuctionIncreases();
    }).then(function(result) {
      return App.updateHighestBidders();
    }).catch(function(err) {
      console.log(err.message);
    });

},

// Function to update auction value increases from base price
// Data obtained from deployed smart contract
updateAuctionIncreases: function () {
  var auctionInstance;

  App.contracts.auto_trade.deployed().then(function(instance) {
    auctionInstance=instance;

    return auctionInstance.getArrayOfIncreases.call(); 
  }).then(function(increases) {
    for (j=0;j<increases.length;j++) {
      $(document).find('.incr-in-value').eq(j).text(`${increases[j]}%`);
    }
  }).catch(function(err) {
    console.log(err.message);
  })
    
},

updateHighestBidders: function () {
  var auctionInstance;

  App.contracts.auto_trade.deployed().then(function(instance) {
    auctionInstance=instance;

    return auctionInstance.getHighestBidders.call(); 
  }).then(function(bidders) {
    for (j=0;j<bidders.length;j++) {
      $(document).find('.highest-bidder').eq(j).text(`${bidders[j]}`);
    }
  }).catch(function(err) {
    console.log(err.message);
  })
},


// Function to handle a bid 
// This function is bound to a user click
// Calls the placeBid function from the deployed smart contract
handleBid: function(event) {
  event.preventDefault();

  var artId = parseInt($(event.target).data('id'));
  var bid_amount = parseInt($(`#input-amt-${artId}`).val());
  
  var auctionInstance;    
  var account = App.account;

  App.contracts.auto_trade.deployed().then(function(instance) {
    auctionInstance = instance;

    // Execute place bid as a transaction by sending account
    return auctionInstance.placeBid(artId, bid_amount, {from: account});
  }).then(function(result) {
    return App.updateAuctionPrices();
  }).catch(function(err) {
    console.log(err.message);
  });
}
};

$(function () {
  $(window).load(function () {
    App.init()
  })
})
