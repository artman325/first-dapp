

function chainConstantsSetup(chainId) {
    
    const t = {
        "0x1": {
            uniswapRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            uniswapRouterFactory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
            weth: "0xc778417E063141139Fce010982780140Aa0cD5Ab"
        }, 
        "0x3": {
            uniswapRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            uniswapRouterFactory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
            weth: "0xc778417E063141139Fce010982780140Aa0cD5Ab"
        }, 
        "0x4": {
            uniswapRouter: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            uniswapRouterFactory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
            weth: "0xc778417E063141139Fce010982780140Aa0cD5Ab"
        }
    };
    
    //console.log('chainId = ',chainId);
    if (chainId == '0x539') {
        chainId = '0x4';
    }

    if (typeof(t[chainId]) === "undefined") {
        console.log("unsupported chain");
    }
    return t[chainId];
}
   
   
var provider;
var chainConstants;
var balances;

async function main() {
    balances = new BalancesBlock();
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
        balances.changedProvider(provider);
        fetchAccountData();
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        console.log("handle:chainChanged");
        
        balances.changedProvider(provider);
        chainConstants = chainConstantsSetup(chainId);
        fetchAccountData();
    });

    provider.on("connect", (networkId) => {
        console.log("handle:connect");
        balances.changedProvider(provider);
        chainConstants = chainConstantsSetup(networkId.chainId);
        
        fetchAccountData();
    });
    provider.on("disconnect", (networkId) => {
        console.log("handle:disconnect");
        balances.changedProvider(null);
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
