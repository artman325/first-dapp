
var provider;

async function main() {
    
    provider = await detectEthereumProvider();
    if (provider) {
    //    await provider.send("eth_requestAccounts", []);
        subscribeHandlers(provider);
        fetchAccountData();
    }
    
    //fetchAccountData();
    
}

async function subscribeHandlers(provider) {
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        console.log("handle:accountsChanged");
        console.log(provider);
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        console.log("handle:chainChanged");
        fetchAccountData();
    });

    provider.on("connect", (networkId) => {
        console.log("handle:connect");
        fetchAccountData();
    });
    provider.on("disconnect", (networkId) => {
        console.log("handle:disconnect");
        fetchAccountData();
        
    });
    
}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }
async function fetchAccountData() {
    console.log("fetchAccountData()");
    let userAddress, userBalance, isConnected;

    if (provider) {
        
        if (provider.selectedAddress) {
            isConnected = true;
            userAddress = ethers.utils.getAddress(provider.selectedAddress);
            
            let t = await provider.send("eth_getBalance", [userAddress, "latest"]);
            userBalance = ethers.utils.formatEther(t.result, {commify: true});
            
        
            $("#navbar .jsWalletAddress").html(userAddress);
            $("#navbar .jsWalletBalance").html(userBalance);
            $("#navbar .jsOnline").show();
            $("#navbar .jsOffline").hide();
        } else {
            delay(100).then(async() => {
                if (provider.selectedAddress) {
                    isConnected = true;
                    userAddress = ethers.utils.getAddress(provider.selectedAddress);

                    let t = await provider.send("eth_getBalance", [userAddress, "latest"]);
                    userBalance = ethers.utils.formatEther(t.result, {commify: true});


                    $("#navbar .jsWalletAddress").html(userAddress);
                    $("#navbar .jsWalletBalance").html(userBalance);
                    $("#navbar .jsOnline").show();
                    $("#navbar .jsOffline").hide();
                }
            });

        }
        
    } else {
        //
    }
    
    if (!isConnected) {
        $("#navbar .jsOnline").hide();
        $("#navbar .jsOffline").show();
    }
    
}

async function walletConnect() {
    console.log("walletConnect()");
    if (!provider) {
        console.log("!provider");
        provider = await detectEthereumProvider();
        
        subscribeHandlers(provider);
    }
    await provider.send("eth_requestAccounts", []);
    fetchAccountData();
    
    
  
}
async function walletDisconnect() {
//    const provider = await detectEthereumProvider();
//    await provider.send("eth_requestAccounts", []);
//    provider.enable();
    console.log("Killing the wallet connection", provider);

    // TODO: Which providers have close method?
    if(provider.close) {
        await provider.close();
    }
    provider = null;
    
    fetchAccountData();
}
if (window.ethereum && window.ethereum.isMetaMask) {
    // metamask is installed
    
    main();
} else {
    $("#navbar .jsOnline, #navbar .jsOffline").hide();
    $("#navbar .jsMetamaskMissed").show();
    
}



$("#navbar .jsWalletConnect").off("click").on("click", function(e) {
    e.preventDefault;
    
    walletConnect();
//    walletConnect().then(result => {
//    // ...
//    console.log(result);
//    }).catch(error => {
//      // if you have an error
//    })
});

$("#navbar .jsWalletDisconnect").off("click").on("click", function(e) {
    e.preventDefault;
    walletDisconnect();
});