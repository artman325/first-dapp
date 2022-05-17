(function(){
var contractStorageObj = new ContractStorage(
    "deployedImplementations",
    $("#tabAdminPage .jsDeployedList")
);

$("#tabAdminPage .jsDeployedListRefresh").off("click").on("click", function(){
    contractStorageObj.writeHtml();
    //refreshDeployedImplementations();
});
$("#tabAdminPage .jsDeployedListTrash").off("click").on("click", function(){
    if (window.confirm("Are you sure to clear list?")) {
        contractStorageObj.clear();
        contractStorageObj.writeHtml();
    }
    
});

$("#tabAdminPage .selectTemplate").off("change").on("change", function(){
    $("#tabAdminPage .tab-templateContent").hide();
    $("#tabAdminPage .tab-"+this.value).show();
     
}).trigger('change');

$('#tabAdminPage .tab-templateContent button').off("click").on("click", function(e){
    e.preventDefault();
    
    if (provider.selectedAddress != null) {
        let option = $("#tabAdminPage .selectTemplate").val();
        let itemExists = contractStorageObj.itemExists(option);
        if (!itemExists || (itemExists && window.confirm("impementation already deployed. are you sure to replace exists?"))) {


            fetch('artifacts/'+option+'.json')
                .then(response => response.text())
                .then( async function(text){
                    text = JSON.parse(text);
                    let abi = text.abi;
                    let bytecode = text.bytecode;

                    const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                    // get a signer wallet!
                    const signer = web3provider.getSigner();

                    
                    
                    
                    var contract;
                    // Deploy an instance of the contract
                    if ((["UniswapV2Factory", "UniswapV2Router02"]).indexOf(option) === -1) {
                        
                        // The factory we use for deploying contracts
                        factory = new ethers.ContractFactory(abi, bytecode, signer)
                        let p = [];
                        if (option == "TestITRc") {
                            p.push('ITRc for Testing');
                            p.push('TITRc');
                            contract = await factory.deploy(...p);
                        } else {
                            contract = await factory.deploy();
                        }
                        
                        contractStorageObj.setItem(option, option, contract.address, provider.selectedAddress);
                    } else {
                        // or attach exists and call method 
                        if (option == 'UniswapV2Factory') {
                            
/*                          
uniswapRouter= 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
uniswapRouterFactory= 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
let q = new ethers.Contract("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", abi, signer);    
await q.createPair(
    "0x895f20789FdfD420496A806Eb30c30082F2e3727",
    "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    {gasLimit: 11000000}
);
*/
                    
                            contract = new ethers.Contract(chainConstants['uniswapRouterFactory'], abi, signer);    
                            
                            let tttt = await contract.allPairsLength();
                            console.log(tttt);
                            
                            let tx = await contract.createPair(
                                ($("#tabAdminPairTokenA").val()).trim(),
                                ($("#tabAdminPairTokenB").val()).trim()
                            );
                    
                            let rc = await tx.wait(); // 0ms, as tx is already confirmed
                            let event = rc.events.find(event => event.event === 'PairCreated');
                            let instance;
                            [,,instance,] = event.args;
                    
                            contractStorageObj.setItem(option, "UniswapPair", instance, provider.selectedAddress);
                    
                        } else if (option == 'UniswapV2Router02') {
                            contract = new ethers.Contract(chainConstants['uniswapRouter'], abi, signer);    

                            let token = $("#tabAdminAddLiquidityTokenA").val();
                            let amountTokenDesired = $("#tabAdminAddLiquidityTokenAAmount").val();
                            let amountTokenMin = 0;
                            let amountETHMin = 0;
                            let to = provider.selectedAddress;
                            let deadline = parseInt(Math.floor(Date.now()/1000))+parseInt(30*24*60*60); // 30 days
                            let ethAmount = $("#tabAdminAddLiquidityTokenAAmount").val();
                            
                            let tmp = contractStorageObj.getItem('TestITRc');

                            if (tmp.address && tmp.address == token) {
                         
                                await fetch('artifacts/TestITRc.json')
                                    .then(response => response.text())
                                    .then( async function(text){
                                        text = JSON.parse(text);
                                        let abi = text.abi;

                                        const titrc = new ethers.Contract(token, text.abi, signer);  
                                        await titrc.mint(to, amountTokenDesired);
                                        await titrc.approve(contract.address, amountTokenDesired);
                                        
                                    });
                                
                            }
                            
                            
                            let tx = await contract.addLiquidityETH(
                                token,
                                amountTokenDesired,
                                amountTokenMin,
                                amountETHMin,
                                to,
                                deadline,
                                {value: ethAmount}
                            );
     
                        }


//                        let rc = await tx.wait(); // 0ms, as tx is already confirmed
//                        let event = rc.events.find(event => event.event === 'InstanceCreated');
//                        let instance, instancesCount;
//                        [instance, instancesCount] = event.args;
//
//                        contractStorageObj.setItem("CommunityCoin", instance, provider.selectedAddress);


                    }
          
                    
                    //saveImplementation(option, contract.address);
                    fetchAccountData();
                    contractStorageObj.refresh();
                    //refreshDeployedImplementations();
    //                console.log(provider.selectedAddress);
    //                const signer = await ethers.provider.getSigner(provider.selectedAddress)
        //            signer.sendTransaction(...) // what does this do?
                });

        }
    }
});


contractStorageObj.refresh();
//refreshDeployedImplementations();
  // outputs the content of the text file

//saveImplementation("lorem", 0x123);
//saveImplementation("dolor", 0x456);

})();