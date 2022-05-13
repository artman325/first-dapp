var implementationStorageObj = new ContractStorage("deployedImplementations");

$("#JsDeployedListRefresh").off("click").on("click", function(){
    implementationStorageObj.writeHtml("adminTabDeployedList");
    //refreshDeployedImplementations();
});
$("#JsDeployedListTrash").off("click").on("click", function(){
    if (window.confirm("Are you sure to clear list?")) {
        implementationStorageObj.clear();
        implementationStorageObj.writeHtml("adminTabDeployedList");
    }
    
});

$("#AdminPage-selectTemlate").off("change").on("change", function(){
    $(".AdminPage-templateContent").hide();
    $(".AdminPage-"+this.value).show();
     
}).trigger('change');

$('.adminPageContainer button').off("click").on("click", function(e){
    e.preventDefault();
    
    
    if (provider.selectedAddress != null) {
        let option = $("#AdminPage-selectTemlate").val();
        let itemExists = implementationStorageObj.itemExists(option);
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

                    implementationStorageObj.setItem(option, contract.address);
                    //saveImplementation(option, contract.address);
                    fetchAccountData();
                    implementationStorageObj.writeHtml("adminTabDeployedList");
                    //refreshDeployedImplementations();
    //                console.log(provider.selectedAddress);
    //                const signer = await ethers.provider.getSigner(provider.selectedAddress)
        //            signer.sendTransaction(...) // what does this do?
                });

        }
    }
});

implementationStorageObj.writeHtml("adminTabDeployedList");
//refreshDeployedImplementations();
  // outputs the content of the text file

//saveImplementation("lorem", 0x123);
//saveImplementation("dolor", 0x456);