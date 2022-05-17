(function(){
    var fraction = 100000;
    var constructorData = {
        CommunityCoinFactory:{
            keys: ["CommunityCoin","CommunityStakingPoolFactory","CommunityStakingPool","CommunityStakingPoolErc20","CommunityRolesManagement"],
            inputClasses:["jsCommunityCoinImpl","jsCommunityStakingPoolFactoryImpl","jsStakingPoolImpl","jsStakingPoolImplErc20","jsRolesManagementImpl"]
        }
    };
    
var contractStorageObj = new ContractStorage(
    "deployedFactories",
    $("#tabFactories .jsDeployedList")
);

$("#tabFactories .jsDeployedListRefresh").off("click").on("click", function(){
    contractStorageObj.writeHtml();
});

$("#tabFactories .jsDeployedListTrash").off("click").on("click", function(){
    if (window.confirm("Are you sure to clear list?")) {
        contractStorageObj.clear();
        contractStorageObj.writeHtml();
    }
});

$("#tabFactories .selectTemplate").off("change").on("change", function(){
    
    let exists = contractStorageObj.itemExists(this.value);
    
    $("#tabFactories .tab-templateContent").hide();
    $("#tabFactories .tab-"+this.value+(exists?"-methods-produce":"")).show();
     
}).trigger('change');

$('#tabFactories .jsPopulate').off("click").on("click", function(e){
    e.preventDefault();
    let implementationStorageObj = new ContractStorage("deployedImplementations");
    let list= implementationStorageObj.getList();
    let constructorParams = constructorData.CommunityCoinFactory;
    
    let index;
    
    for (let item of list) {
        index = (constructorParams.keys).indexOf(item.name);
        console.log(item.name);
        console.log(index);
        if (index !== -1) {
            $("#tabFactories ."+(constructorParams.inputClasses)[index]).val(item.address);
        }
        if (item.name == name) {
            return true;
        }
    }
});

$('#tabFactories .tab-CommunityCoinFactory button').off("click").on("click", function(e){
    e.preventDefault();
    
    if (provider.selectedAddress != null) {
        let option = $("#tabFactories .selectTemplate").val();
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
                    
                    if (option == 'CommunityCoinFactory') {
                        let list = constructorData[option].inputClasses;
                        let p = [];
                        for (let item of list) {
                            p.push($("#tabFactories ."+item).val());
                        }
                        contract = await factory.deploy(...p);
                                
                    } else {
                        contract = await factory.deploy();
                    }

                    contractStorageObj.setItem(option, option, contract.address, provider.selectedAddress);
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
$('#tabFactories .tab-CommunityCoinFactory-methods-produce button').off("click").on("click", function(e){
    e.preventDefault();
    
    if (provider.selectedAddress != null) {
        let option = $("#tabFactories .selectTemplate").val();
        let itemExists = contractStorageObj.itemExists(option);
        if (itemExists) {

            itemExists = contractStorageObj.itemExists('CommunityCoin');
            if (!itemExists || (itemExists && window.confirm("CommunityCoin already deployed. are you sure to replace exists?"))) {
                fetch('artifacts/'+option+'.json')
                    .then(response => response.text())
                    .then( async function(text){
                        text = JSON.parse(text);
                        let abi = text.abi;
                        //let bytecode = text.bytecode;

                        const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                        // get a signer wallet!
                        const signer = web3provider.getSigner();

                        let factoryStorageObj = new ContractStorage("deployedFactories");
                        let item = factoryStorageObj.getItem(option);

                        const contract = new ethers.Contract(item.address, abi, signer);

                        
                        let p = [];
                        p.push($("#tabFactoriesHook").val());
                        p.push(ethers.BigNumber.from(fraction).mul($("#tabFactoriesDiscountSensitivity").val()));
                        let pp = [];
                        pp.push($("#tabFactoriesCommunityAddress").val());
                        pp.push($("#tabFactoriesCommunityAdminRole").val());
                        pp.push($("#tabFactoriesCommunityRedeemRole").val());
                        pp.push($("#tabFactoriesCommunityCirculationRole").val());
                        p.push(pp);
    
                        let tx = await contract.produce(...p);
                        
                        let rc = await tx.wait(); // 0ms, as tx is already confirmed
                        let event = rc.events.find(event => event.event === 'InstanceCreated');
                        let instance, instancesCount;
                        [instance, instancesCount] = event.args;

                        contractStorageObj.setItem("CommunityCoin", "CommunityCoin", instance, provider.selectedAddress);


                        fetchAccountData();
                        contractStorageObj.refresh();

                    });
            }
        }
    }
});
contractStorageObj.refresh();

})();