class TabUsers {
    constructor() {
        
        this.contractStorageObj = new ContractStorage(
            "users",
            $("#tabUsers .jsDeployedList")
        );

        this.setupHandlers();
        
        //this.refresh();
    }
    refresh() {
        this.fillSelect();
        
        this.contractStorageObj.refresh();
    }
    fillSelect() {
        let obj = $("#tabUsers select.selectTemplate");
        
        let list = new ContractStorage('pools').getList();
console.log("==========================");
console.log(list);
        obj.html('');
        if (list.length>0) {
            for (let item of list) {
                obj.append('<option value='+item.address+'>'+item.title+'</option>');
            }
        }        
    }
    setupHandlers() {
        var obj = this;
        $("#tabUsers .jsDeployedListRefresh").off("click").on("click", function(){
            obj.contractStorageObj.writeHtml();
        });
    
        $("#tabUsers .jsDeployedListTrash").off("click").on("click", function(){
            if (window.confirm("Are you sure to clear list?")) {
                obj.contractStorageObj.clear();
                obj.contractStorageObj.writeHtml();
            }

        });
        $("#tabUsers .selectTemplate").off("change").on("change", function(){
            $("#tabPools .tab-templateContent").hide();
            if (this.value) {
                $("#tabPools .tab-form-stake").show();
            }
            

        }).trigger('change');

        $('#tabUsers .tab-templateContent button').off("click").on("click", async function(e){
            e.preventDefault();
            let option = $("#tabUsers .selectTemplate").val();
            if (provider.selectedAddress != null) {
                
                const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                // get a signer wallet!
                const signer = web3provider.getSigner();

                const CommunityStakingPool = new ethers.Contract(option, artifacts.getAbi("CommunityStakingPool"), signer);
                
                let addr = ($('#tabUsersPayingTokenAddress').val()).trim();
                let amount = $('#tabUsersPayingTokenAmount').val();
                let beneficiary = $('#tabUsersBeneficiary').val();
                
                let tx;
                let p=[];
                if (addr == '0x0000000000000000000000000000000000000000') {
                    const WETH = new ethers.Contract(chainConstants['weth'], artifacts.getAbi("IWETH"), signer);    
                    await WETH.deposit({value: amount});
                    const WETH_ERC20 = new ethers.Contract(chainConstants['weth'], artifacts.getAbi("TestITRc"), signer); // here just need erc20::approve
                    await WETH_ERC20.approve(option, amount);
                    
                    p.push(amount);
                    p.push(beneficiary);
                    tx = await CommunityStakingPool["buyLiquidityAndStake(uint256,address)"](...p);    
                    
                } else {
                    
                    p.push(addr);
                    p.push(amount);
                    p.push(beneficiary);
                    tx = await CommunityStakingPool["buyLiquidityAndStake(address,uint256,address)"](...p);    
                }
                
        
            }

            obj.contractStorageObj.refresh();
        });
        
        $('#tabUsers .tab-form-stake .jsApprove').off("click").on("click", async function(e){
            e.preventDefault();
            
            if (provider.selectedAddress != null) {
                let addr = ($('#tabUsersPayingTokenAddress').val()).trim();
                let amount = $('#tabUsersPayingTokenAmount').val();
                
                let testitrc = (new ContractStorage('deployedImplementations')).getItem('TestITRc');
                if (addr == '') {
                    alert('Paying token address can not be empty');
                } else {
                    
                    if ([
                        //testitrc.address,
                        '0x0000000000000000000000000000000000000000'
                    ].indexOf(addr) === -1) {
                        if (window.confirm("Are you sure you want to approve "+ ethers.utils.formatEther(amount, {commify: true})+" ETH to "+addr+"?")) {

                            await testitrc.mint(provider.selectedAddress, amount);
                            await testitrc.approve(addr, amount);
                            
                        }
                    } {
                        alert("There no need approve action if Paying token are ZERO address");
                    }
                
                }
                
            }
        });
        
    }
}



