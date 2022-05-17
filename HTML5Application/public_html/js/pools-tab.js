(function(){
var contractStorageObj = new ContractStorage(
    "pools",
    $("#tabPools .jsDeployedList")
);

var CommunityCoinAbi, 
    CommunityCoinBytecode,
    ERC20Abi, 
    ERC20Bytecode
;


    fetch('artifacts/CommunityCoin.json')
        .then(response => response.text())
        .then( async function(text){
            text = JSON.parse(text);
            CommunityCoinAbi = text.abi;
            CommunityCoinBytecode = text.bytecode;           
        });

    fetch('artifacts/TestITRc.json')
        .then(response => response.text())
        .then( async function(text){
            text = JSON.parse(text);
            ERC20Abi = text.abi;
            ERC20Bytecode = text.bytecode;           
        
        });


$("#tabPools .jsDeployedListRefresh").off("click").on("click", function(){
    contractStorageObj.writeHtml();
    //refreshDeployedImplementations();
});
$("#tabPools .jsDeployedListTrash").off("click").on("click", function(){
    if (window.confirm("Are you sure to clear list?")) {
        contractStorageObj.clear();
        contractStorageObj.writeHtml();
    }
    
});

$("#tabPools .selectTemplate").off("change").on("change", function(){
    $("#tabPools .tab-templateContent").hide();
    $("#tabPools .tab-"+this.value).show();

}).trigger('change');

$('#tabPools .tab-templateContent button').off("click").on("click", async function(e){
    e.preventDefault();

    if (provider.selectedAddress != null) {
        let option = $("#tabPools .selectTemplate").val();
        
        

        const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        // get a signer wallet!
        const signer = web3provider.getSigner();


        let factoryStorageObj = new ContractStorage("deployedFactories");
        let item = factoryStorageObj.getItem('CommunityCoin');

        const contract = new ethers.Contract(item.address, CommunityCoinAbi, signer);
 
//
//t = new ethers.Contract("0xc778417E063141139Fce010982780140Aa0cD5Ab", ERC20Abi, signer);
//console.log(await t.symbol());
//            
//return;



        let tx, rc, event, instance;
        let p = [];

        if (option == 'produce') {

            p.push($("#tabPoolsReserveToken").val());
            p.push($("#tabPoolsTradedToken").val());
            p.push($("#tabPoolsDuration").val());
            p.push([]);//p.push($("#tabPoolsDonations").val());
            p.push($("#tabPoolsReserveTokenClaimFraction").val());
            p.push($("#tabPoolsTradedTokenClaimFraction").val());
            p.push($("#tabPoolsLpClaimFraction").val());
            p.push($("#tabPoolsNumerator").val());
            p.push($("#tabPoolsDenominator").val());



            tx = await contract["produce(address,address,uint64,(address,uint256)[],uint64,uint64,uint64,uint64,uint64)"](...p);

            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceCreated');
            
        } else if (option == 'produce-erc20') {

            p.push($("#tabPoolsErc20TokenErc20").val());
            p.push($("#tabPoolsErc20Duration").val());
            p.push([]);//p.push($("#tabPoolsDonations").val());
            p.push($("#tabPoolsErc20Numerator").val());
            p.push($("#tabPoolsErc20Denominator").val());

            tx = await contract["produce(address,uint64,(address,uint256)[],uint64,uint64)"](...p);

            rc = await tx.wait(); // 0ms, as tx is already confirmed
            event = rc.events.find(event => event.event === 'InstanceErc20Created');

        }

//                emit InstanceCreated(reserveToken, tradedToken, instance);
//                emit InstanceErc20Created(tokenErc20, instance);


        let t, symbols;
        symbols=[];

        for(var i=0; i<event.args.length-1; i++) {
            t = new ethers.Contract(event.args[i], ERC20Abi, signer);
            symbols.push(await t.symbol());
            
        }

        instance = event.args[event.args.length-1];

        contractStorageObj.setItem(instance, symbols.join('-'), instance, provider.selectedAddress);

    }   
    contractStorageObj.refresh();
    
});

contractStorageObj.refresh();
//refreshDeployedImplementations();
  // outputs the content of the text file

//saveImplementation("lorem", 0x123);
//saveImplementation("dolor", 0x456);

})();