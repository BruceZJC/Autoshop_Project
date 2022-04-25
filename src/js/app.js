App = {
  web3Provider: null,
  contracts: {},
  account: "",

  init: async function() {
    // Load pets.
    $.getJSON('../cars.json', function(data) {
      var carRow = $('#carRow');
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
        carTemplate.find('.ipt-amt').attr('id',`input-amt-${data[i].id}`); // same as above for input amount
        carRow.append(carTemplate.html());
      }

      var carRow2 = $('#carRow2');
      var carTemplate2 = $('#carTemplate2');
      for (i = 0; i < data.length; i ++) {
        carTemplate2.find('.panel-title').text(`Vehicle ${i+1}`); // auction number as title
        carTemplate2.find('img').attr('src', data[i].picture); // image 
        carTemplate2.find('.vehicle_brand').text(data[i].vehicle_brand); // name of item 
        carTemplate2.find('.vehicle_model').text(data[i].vehicle_model); // name of item 
        carTemplate2.find('.buy_now_price').text(`ETH ${data[i].buy_now_price}`); // name of item 
        carTemplate2.find('.description').text(data[i].description); // decription of the item
        carTemplate2.find('.min_incr').text(`ETH ${data[i].min_incr}`); // minimum increment
        carTemplate2.find('.starting_price').text(`ETH ${data[i].starting_price}`); // base price

        // Creating identifier attributes for HTML elements
        carTemplate2.find('.highest-bid').attr('data-id', data[i].id); // adding attribute to the highest bid so we can dynamically change it
        carTemplate2.find('.btn-submit').attr('data-id', data[i].id); // adding attribute for submit so we can associate itemids to submit buttons
        carTemplate2.find('.ipt-amt').attr('id',`input-amt-${data[i].id}`); // same as above for input amount
        carRow2.append(carTemplate2.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });;
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);


    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
  // Get the necessary contract artifact file and instantiate it with @truffle/contract
  var AdoptionArtifact = data;
  App.contracts.Adoption = TruffleContract(AdoptionArtifact);

  // Set the provider for our contract
  App.contracts.Adoption.setProvider(App.web3Provider);

  web3.eth.getCoinbase(function(err, account) {
    if (err === null) {
      App.account = account;
      $("#account").text(account);
    }
  })

  // Use our contract to retrieve and mark the adopted pets
  return App.markPurchased(), App.updateOfferPrice(), App.updateOfferIncreases();
});


    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handlePurchase);
    $(document).on('click', '.btn-submit', App.updateOfferPrice);
    $(document).on('click', '.btn-submit', App.updateOfferIncreases);
  },

  markPurchased: function() {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

  return adoptionInstance.getBuyers.call();
}).then(function(adopters) {
  for (i = 0; i < adopters.length; i++) {
    if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
      $('.panel-car').eq(i).find('button').text('Success').attr('disabled', true);
    }
  }
}).catch(function(err) {
  console.log(err.message);
});

  },

  handlePurchase: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var bid_amount = parseInt($(event.target).data('buy_now_price'));

    var purchaseInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

    var account = accounts[0];

    App.contracts.Adoption.deployed().then(function(instance) {
      purchaseInstance = instance;

    // Execute adopt as a transaction by sending account
    return purchaseInstance.buyNow(petId, bid_amount, {from: account});
    }).then(function(result) {
      return App.markPurchased();
    }).catch(function(err) {
      console.log(err.message);
    });
  });

  },

  updateOfferPrice: function() {
    var offerInstance;
    App.contracts.Adoption.deployed().then(function(instance) {
      offerInstance = instance;
      return offerInstance.getAllPrices()
    }).then(function(a) {
        for (j=0; j < a.length; j++) {
          document.write(1111)
          $(document).find('.highest-bid').eq(j).text(`$${a[j]}`);
        }
      }).catch(function(err) {
        console.log(err.message);
      });
  
  },
  
  // Function to update auction value increases from base price
  // Data obtained from deployed smart contract
  updateOfferIncreases: function () {
    var auctionInstance;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      auctionInstance=instance;
      return auctionInstance.getAllIncrease(); 
    }).then(function(increases) {
      for (j=0;j<increases.length;j++) {
        $(document).find('.incr-in-value').eq(j).text(`${increases[j]}%`);
      }
    }).catch(function(err) {
      console.log(err.message);
    })
      
  },

  handleNewOffer: function(event) {
    event.preventDefault();
    var carId = parseInt($(event.target).data('id'));
    var bid_amount = parseInt($(`#input-amt-${carId}`).val());
    
    var auctionInstance;    
    var account = App.account;
  
    App.contracts.Adoption.deployed().then(function(instance) {
      auctionInstance = instance;
  
      // Execute place bid as a transaction by sending account
      return auctionInstance.placeOffer(carId, bid_amount, {from: account});
    }).then(function(result) {
      return App.updateOfferPrice();
    }).catch(function(err) {
      console.log(err.message);
    });
    }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
