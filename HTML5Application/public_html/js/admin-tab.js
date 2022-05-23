class TabAdmins {
    constructor() {
        
        this.contractStorageObj = new ContractStorage(
            "deployedImplementations",
            $("#tabAdmins .jsDeployedList")
        );

        this.setupHandlers();
        
        //this.refresh();
    }
    refresh() {
        console.log("TabAdmins:refresh");
        this.contractStorageObj.refresh();
        fetchAccountData();
    }
    setupHandlers() {
        var objThis = this;
        
        $("#tabAdmins .jsDeployedListRefresh").off("click").on("click", function(){
            objThis.contractStorageObj.writeHtml();
            //refreshDeployedImplementations();
        });
        $("#tabAdmins .jsDeployedListTrash").off("click").on("click", function(){
            //if (window.confirm("Are you sure to clear list?")) {
            if (objThis.contractStorageObj.confirmClear()) {
                objThis.contractStorageObj.clear();
                objThis.contractStorageObj.writeHtml();
            }

        });

        $("#tabAdmins .selectTemplate").off("change").on("change", function(){
            $("#tabAdmins .tab-templateContent").hide();
            $("#tabAdmins .tab-"+this.value).show();

        }).trigger('change');

        $('#tabAdmins .tab-templateContent button').off("click").on("click", function(e){
            e.preventDefault();

            if (provider.selectedAddress != null) {
                let option = $("#tabAdmins .selectTemplate").val();
                let itemExists = objThis.contractStorageObj.itemExists(option);
                if (
                        !itemExists || 
                        (
                            itemExists && 
                            (
                                ((["UniswapV2Factory", "UniswapV2Router02"]).indexOf(option) !== -1) ||
                                window.confirm("impementation already deployed. are you sure to replace exists?")
                            )
                        )) 
                {


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
                            var tx, rc;
                            // Deploy an instance of the contract
                            if ((["UniswapV2Factory", "UniswapV2Router02"]).indexOf(option) === -1) {

                                // The factory we use for deploying contracts
                                let factory = new ethers.ContractFactory(abi, bytecode, signer)
                                let p = [];
                                if (option == "TestITRc") {
                                    p.push('ITRc for Testing');
                                    p.push('TITRc');
                                    contract = await factory.deploy(...p);
                                } else {
                                    contract = await factory.deploy();
                                }
                                
                                objThis.contractStorageObj.setItem(option, option, contract.address, provider.selectedAddress);
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

                                    //let tttt = await contract.allPairsLength();
                                    

                                    tx = await contract.createPair(
                                        ($("#tabAdminPairTokenA").val()).trim(),
                                        ($("#tabAdminPairTokenB").val()).trim()
                                    );

                                    rc = await tx.wait(); // 0ms, as tx is already confirmed
                                    
                                    let event = rc.events.find(event => event.event === 'PairCreated');
                                    let instance;
                                    [,,instance,] = event.args;

                                    objThis.contractStorageObj.setItem(option, "UniswapPair TestITRc-WETH", instance, provider.selectedAddress);

                                } else if (option == 'UniswapV2Router02') {
//                                    
//                                    let $modalDiv = $('<div />').
//                                            addClass('modal-dialog').
//                                            addClass('modal-dialog-centered').
//                                            appendTo('body');
//                                    let $tableList = $('<table/>').appendTo($modalDiv);
//                                    let $tbody = $('<tbody/>').appendTo($tableList);
//                                    
//                                    $tbody.append('<tr><td>111111111</td><td>22222222222</td></tr>');
//                                    $tbody.append('<tr><td>33333333</td><td>44444444444</td></tr>');
//                                    $tbody.append('<tr><td>5555555555555</td><td>6666666666</td></tr>');
//                                    
                                    
                                    
                                    
                                    
                                    contract = new ethers.Contract(chainConstants['uniswapRouter'], abi, signer);    

                                    let token = $("#tabAdminAddLiquidityTokenA").val();
                                    let amountTokenDesired = $("#tabAdminAddLiquidityTokenAAmount").val();
                                    let amountTokenMin = 0;
                                    let amountETHMin = 0;
                                    let to = provider.selectedAddress;
                                    let deadline = parseInt(Math.floor(Date.now()/1000))+parseInt(30*24*60*60); // 30 days
                                    let ethAmount = $("#tabAdminAddLiquidityTokenAAmount").val();

                                    let tmp = objThis.contractStorageObj.getItem('TestITRc');
                                    let premint_preapprove = (tmp.address && tmp.address == token);
                                    let titrc = new ethers.Contract(token, artifacts.getAbi("TestITRc"), signer);
                                    
                                    
                                    let $modalDiv, $modalBody;
                                    [$modalDiv, /*header*/, $modalBody,/*footer*/] = createModalBootstrap('Processing transactions');
                                    
                                    
                                    let $tableList = $('<table/>').addClass("table table-striped").appendTo($modalBody);
                                    let $tbody = $('<tbody/>').appendTo($tableList);
                                    
                                    if (premint_preapprove) {
                                        $tbody.append('<tr class="stepPreMint"><td>Pre-mint:</td><td><i class="fa fa-refresh fa-spin"></i></td></tr>');
                                        $tbody.append('<tr class="stepPreApprove"><td>Pre-Approve</td><td><i class="fa fa-refresh fa-spin"></i></td></tr>');
                                    }
                                    
                                    $tbody.append('<tr class="stepTx"><td>addLiquidityETH</td><td><i class="fa fa-refresh fa-spin"></i></td></tr>');
                                    
                                    $modalDiv.modal('show');
                                    
//return;
                                    
                                    if (premint_preapprove) {
                                        $tbody.find('tr.stepPreMint td:nth-child(1)').css('font-weight', 'bold');
                                        try {
                                            tx = await titrc.mint(to, amountTokenDesired);
                                        } catch(e){
                                            $tbody.find('tr.stepPreMint td:nth-child(2)').html(e.data.message);
                                            return;
                                        };
                                        rc = await tx.wait();
                                        $tbody.find('tr.stepPreMint td:nth-child(2)').html((rc.status == 1)? 'Success' : 'Failed');
                                        if (rc.status != 1) {return;}
                                        $tbody.find('tr.stepPreMint td:nth-child(1)').css('font-weight', 'normal');
                                        
                                        $tbody.find('tr.stepPreApprove td:nth-child(1)').css('font-weight', 'bold');
                                        try {
                                            tx = await titrc.approve(contract.address, amountTokenDesired);
                                        } catch(e){
                                            $tbody.find('tr.stepPreApprove td:nth-child(2)').html(e.data.message);
                                            return;
                                        };
                                        rc = await tx.wait();
                                        $tbody.find('tr.stepPreApprove td:nth-child(2)').html((rc.status == 1)? 'Success' : 'Failed');
                                        if (rc.status != 1) {return;}
                                        $tbody.find('tr.stepPreApprove td:nth-child(1)').css('font-weight', 'normal');
                                    }

                                    $tbody.find('tr.stepTx td:nth-child(1)').css('font-weight', 'bold');
                                    try {                                    
                                        tx = await contract.addLiquidityETH(
                                            token,
                                            amountTokenDesired,
                                            amountTokenMin,
                                            amountETHMin,
                                            to,
                                            deadline,
                                            {value: ethAmount}
                                        );

                                    } catch(e){
                                        $tbody.find('tr.stepTx td:nth-child(2)').html(e.data.message);
                                        return;
                                    };
                                    rc = await tx.wait();
                                    $tbody.find('tr.stepTx td:nth-child(2)').html((rc.status == 1)? 'Success' : 'Failed');
                                    if (rc.status != 1) {return;}
                                    $tbody.find('tr.stepTx td:nth-child(1)').css('font-weight', 'normal');

                                }


        //                        let rc = await tx.wait(); // 0ms, as tx is already confirmed
        //                        let event = rc.events.find(event => event.event === 'InstanceCreated');
        //                        let instance, instancesCount;
        //                        [instance, instancesCount] = event.args;
        //
        //                        objThis.contractStorageObj.setItem("CommunityCoin", instance, provider.selectedAddress);


                            }


                            //saveImplementation(option, contract.address);
                            
                            objThis.refresh();
                            //refreshDeployedImplementations();
            //                console.log(provider.selectedAddress);
            //                const signer = await ethers.provider.getSigner(provider.selectedAddress)
                //            signer.sendTransaction(...) // what does this do?
                        });

                }
            }
        });

    }
}
