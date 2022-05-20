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
        let obj = $("#tabUsers select.tabUsersCommunityStakingPoolAddressSelect");
        
        let list = new ContractStorage('pools').getList();

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
            $("#tabUsers .tab-templateContent").hide();
            $("#tabUsers .tab-"+this.value).show();
            if (this.value == 'buyandstake') {
                $("#tabUsers .tabUsersCommunityStakingPoolAddressSelect").trigger('change');
            }
        }).trigger('change');
        
        async function fillTradedReserveTokensInput(addr) {
            
            let traded,reserve;
            try {
                const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = web3provider.getSigner();
                const pool = new ethers.Contract(addr, artifacts.getAbi("CommunityStakingPool"), signer);    

                traded = await pool.tradedToken();
                reserve = await pool.reserveToken();
            }
            catch(e) {
                console.log('request error');
            }
            $('#tabUsersTradedTokenAddress').val(traded);
            $('#tabUsersReserveTokenAddress').val(reserve);
            
        }
        
        $("#tabUsers .tabUsersCommunityStakingPoolAddressSelect").off("change").on("change", async function(){
            var addr = this.value;
            
            await fillTradedReserveTokensInput(addr);

        });//.trigger('change');
        
        $("#tabUsers .tabUsersCommunityStakingPoolAddressInput").off("keyup").on("keyup", async function(){
            var addr = $(this).val();
            
            await fillTradedReserveTokensInput(addr);

        });//.trigger('keyup');

        
        $("#tabUsers .jsRadioPayingChoise label").off("click").on("click", function(){
            let option = this.id;
            
            $('.jsSwitch').hide();
            $('.jsSwitch-'+option).show();    
            
        }).trigger('click');        
        
        $('#tabUsers .tab-templateContent button').off("click").on("click", async function(e){
            e.preventDefault();
            
            
            if (provider.selectedAddress != null) {
                
                
                const web3provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                // get a signer wallet!
                const signer = web3provider.getSigner();
                
                let communityStakingPoolAddress = ($('#tabUsers .tabUsersCommunityStakingPoolAddressInput').val().trim());
                if (communityStakingPoolAddress == '') {
                    communityStakingPoolAddress = ($("#tabUsers .tabUsersCommunityStakingPoolAddressSelect").val().trim());
                } else {
                }
                
                const CommunityStakingPool = new ethers.Contract(communityStakingPoolAddress, artifacts.getAbi("CommunityStakingPool"), signer);
                const PoolTradedTokenAddress = await CommunityStakingPool.tradedToken();
                const PoolReserveTokenAddress = await CommunityStakingPool.reserveToken();
                const WETH = new ethers.Contract(chainConstants['weth'], artifacts.getAbi("IWETH"), signer);    
                
                let payingchoise = $('#tabUsers .jsRadioPayingChoise label input[name="payingchoise"]:checked').val();
                let amount;
                
                switch (payingchoise) {
                  case 'Reserved':
                        amount = $('#tabUsersReservedTokenAmount').val();
                        const Reserved_ERC20 = new ethers.Contract(PoolTradedTokenAddress, artifacts.getAbi("TestITRc"), signer); // here just need erc20::approve
                        await Reserved_ERC20.approve(communityStakingPoolAddress, amount);
                        //function buyLiquidityAndStake(uint256 amountTradedToken)
                        await CommunityStakingPool["buyLiquidityAndStake(uint256)"](amount);    
                    break;
                  case 'Paying':
                        let payingTokenAddress = $('#tabUsersPayingTokenAddress').val()
                        amount = $('#tabUsersPayingTokenAmount').val();
                        
                        const Paying_ERC20 = new ethers.Contract(payingTokenAddress, artifacts.getAbi("TestITRc"), signer); // here just need erc20::approve
                        await Paying_ERC20.approve(communityStakingPoolAddress, amount);
                        //function buyLiquidityAndStake(address payingToken, uint256 amount)
                        await CommunityStakingPool["buyLiquidityAndStake(address,uint256)"](payingTokenAddress, amount);    
                    break;
                  case 'ETH':
                    amount = $('#tabUsersETHAmount').val();
                    if (PoolReserveTokenAddress == chainConstants['weth']) {
                        await WETH.deposit({value: amount});
                        const WETH_ERC20 = new ethers.Contract(chainConstants['weth'], artifacts.getAbi("TestITRc"), signer); // here just need erc20::approve
                        await WETH_ERC20.approve(communityStakingPoolAddress, amount);
                        //function buyLiquidityAndStake(uint256 tokenBAmount) 
                        await CommunityStakingPool["buyLiquidityAndStake(uint256)"](amount);    
                        
                    } else {
                        
                        await CommunityStakingPool["buyLiquidityAndStake()"]({value: amount});    
                        //function buyLiquidityAndStake() public payable 
                    }
                    break;
                  default:
                    alert( "unknown paying method" );
                }
            }

            obj.contractStorageObj.refresh();
        });
        /*
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
        */
    }
}



