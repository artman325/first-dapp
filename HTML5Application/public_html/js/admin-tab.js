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

                    // The factory we use for deploying contracts
                    factory = new ethers.ContractFactory(abi, bytecode, signer)

                    // Deploy an instance of the contract
                    contract = await factory.deploy();

                    contractStorageObj.setItem(option, contract.address, provider.selectedAddress);
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