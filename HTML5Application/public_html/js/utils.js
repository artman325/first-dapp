/*
 * js class needed to update some data have got from async requests.
 * native setInterval not good expecially if need call forceRefresh method
 * so we used loop while(true){} with delay inside. when force refresh happen 
 * we will stop loop, wait until loop refresh has been done, make force refresh 
 * and resume loop. it will avoiding intersected requests
 */
class BalancesBlock {
    
    constructor() {
        this.balancesBlockObj = $('#BalancesBlock');
        this.blockNumberObj = $('#BalancesBlock .blockNumber');
        this.blockTableObj = $('#BalancesBlock .blockTable');
        this.userStakesTableObj = $('#tabUsers .blockTable');
        this.msToRefresh = 5000;
        this.provider = null;
        this.loopCondition = true;
        
        this.loopRefreshingNow = false;
        this.isRefreshingNow = false;
        
        this.loop();
        
        this.qqq = 1111;
        var objThis = this;
        fetch('artifacts/TestITRc.json')
        .then(response => response.text())
        .then( async function(text){
            text = JSON.parse(text);
            objThis.ERC20Abi = text.abi;
        });
        
        fetch('artifacts/CommunityStakingPool.json')
        .then(response => response.text())
        .then( async function(text){
            text = JSON.parse(text);
            objThis.CommunityStakingPoolAbi = text.abi;
        });
        fetch('artifacts/CommunityCoin.json')
        .then(response => response.text())
        .then( async function(text){
            text = JSON.parse(text);
            objThis.CommunityCoinAbi = text.abi;
        });
        
    }
    
    async changedProvider(provider) {
        //console.log("BalancesBlock::changedProvider");
        this.provider = provider;
        //console.log('selectedAddress=', provider.selectedAddress);
        await this.refresh();
    }
    
    async refresh() {

        this.loopCondition = false;

        // await until isRefreshingNow eq false;
        let tryTimes=0;
        
        while (tryTimes<5 && this.isRefreshingNow == true) {
            await this.delay(1000);    
            tryTimes+=1;
        }

        if (this.isRefreshingNow == false) {
            await this._refresh();
        } else {
            console.log("can't refresh");
        }

        this.loopCondition = true;
        this.loop();
        
    }
    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
      }
    async _refresh() {
        this.isRefreshingNow = true;
        ////////////////////////////

        let tmp,blockNumber, userBalance, userCoins, coinsTotalValue;
        
        let listPools = new ContractStorage('pools').getList();
        let stakesList=[];
        let communityCoinItem = new ContractStorage('deployedFactories').getItem("CommunityCoin");
        
//        $("#navbar .jsWalletAddress").html(userAddress);
//        $("#navbar .jsWalletBalance").html(userBalance);
        
        if (this.provider && this.provider.selectedAddress) {
            tmp = await this.provider.send("eth_blockNumber",[]);
            blockNumber = tmp.result;
            
            tmp = await this.provider.send("eth_getBalance", [ethers.utils.getAddress(this.provider.selectedAddress), "latest"]);
            userBalance = ethers.utils.formatEther(tmp.result, {commify: true});
            
            try {
             
                if (listPools.length>0) {

                    const signer = (new ethers.providers.Web3Provider(window.ethereum, "any")).getSigner();

                    tmp = new ethers.Contract(communityCoinItem.address, this.CommunityCoinAbi, signer);
                    userCoins = ethers.utils.formatEther(await tmp.balanceOf(this.provider.selectedAddress), {commify: true});
                    coinsTotalValue = ethers.utils.formatEther(await tmp.totalSupply(), {commify: true});
                    
                    stakesList = await tmp.viewLockedWalletTokensList(this.provider.selectedAddress);

                    for (let pool of listPools) {

                        tmp = new ethers.Contract(pool.address, this.CommunityStakingPoolAbi, signer);
                        //item.totalbalance 
                        let pairAddress = await tmp.uniswapV2Pair();
                        //console.log(pair);
                        let pairContract = new ethers.Contract(pairAddress, this.ERC20Abi, signer);
                        //console.log(await tmp.balanceOf(this.provider.selectedAddress));
                        pool.uniswaplpTokens = ethers.utils.formatEther(await pairContract.balanceOf(pool.address), {commify: true,pad:6});
                    }
                }  
   
            }
            catch (e){
                console.log("catch (e){");
                userCoins = '--';
                coinsTotalValue = '--';
                
            }
            $("#BalancesBlock .jsAlertBox").hide();
        } else {
            userCoins = '--';
            userBalance = '--';
            coinsTotalValue = '--';
            blockNumber = 0;
            $("#BalancesBlock .jsAlertBox").html("Wallet is not connected").show();
        }
        
        //synth delay
        //await this.delay(4000);
        
        let jSelector;
        
        this.blockNumberObj.html('#'+parseInt(blockNumber));
        this.blockTableObj.find(".nodelete .ethValue").html(userBalance);
        this.blockTableObj.find(".nodelete .coinsValue").html(userCoins);
        this.blockTableObj.find(".nodelete .coinsTotalValue").html(coinsTotalValue);
        
        
        this.blockTableObj.find("tr").not(".nodelete").remove();
        jSelector = this.blockTableObj.find(".nodelete:last");
        for (let item of listPools) {
            jSelector.after("<tr><th>"+item.title+"</th><th>"+item.uniswaplpTokens+"</th></tr>")
        }
        ///////////////////////////////////////
        this.userStakesTableObj.find("tr").not(".nodelete").remove();
        jSelector = this.userStakesTableObj.find(".nodelete:last");
//                       // stakesList[item][0] = ethers.utils.formatEther(stakesList[item][0], {commify: true});
//                       // stakesList[item][1] = (new Date(parseInt(stakesList[item][1]) * 1000)).toLocaleDateString('en-US');
        for (let item of stakesList) {
//            jSelector.after("<tr><th>"+item[0]+"</th><th>"+item[1]+"</th></tr>")
          jSelector.after("<tr><th>"+ethers.utils.formatEther((item[0].toString()), {commify: true})+"</th><th>"+(new Date(parseInt(item[1]) * 1000)).toLocaleDateString('en-US')+"</th></tr>")
        }   
                
        ////////////////////////////
        this.isRefreshingNow = false;
    }
    
    async loop() {
        console.log("---------------------- loop started ---------------------- ");
        if (this.loopRefreshingNow) {
        } else {
            this.loopRefreshingNow = true;
            while (this.loopCondition) {
                console.log('while (this.loopCondition)');
                /* code to wait on goes here (sync or async) */    
                await this._refresh();
                await this.delay(this.msToRefresh)
            }
            this.loopRefreshingNow = false;
        }
        console.log("---------------------- loop ended ---------------------- ");
    }
}

class ContractStorage {
    
    constructor(key, jquerySelectorObj) {
        
        this.key = key;
        this.jquerySelectorObj = jquerySelectorObj;
        
    }
    _getChainKey() {
        return provider.chainId;
    }
    confirmClear() {
        
        return window.confirm("Are you sure to clear storage for ChainID="+provider.chainId+"");
    }
    clear() {
        let list = localStorage.getItem(this._getChainKey());
        list = (typeof(list) === 'undefined' || list == null) ? {} : JSON.parse(list);
        list[this.key] = [];
        
        localStorage.setItem(this._getChainKey(), JSON.stringify(list));
    }

    getList() {
        if (provider && provider.chainId) {
            let data = localStorage.getItem(this._getChainKey());

            data = (typeof(data) === 'undefined' || data == null) ? [] : JSON.parse(data);

            return (typeof(data[this.key]) === 'undefined' || data[this.key] == null) ? []:data[this.key];
        } else {
            
            return [];
        }
    }
    saveList(list) {

        let data = localStorage.getItem(this._getChainKey());

        data = (typeof(data) === 'undefined' || data == null) ? {} : JSON.parse(data);

        data[this.key] = list;

        localStorage.setItem(this._getChainKey(), JSON.stringify(data));
    }
    getItem(name) {
        let address, creator;
        let list = this.getList();
        
        for (let i=0; i<list.length; i++) {
            if (list[i].name == name) {
                address = list[i].address;
                creator = list[i].creator;
                break;
            }
        }
        
        return {
            name: name,
            address: address, 
            creator: creator
        };

    }
    setItem(name, title, address, creator) {


        let list = this.getList();

        let index=null;
        for (let i=0; i<list.length; i++) {
            
            if (list[i].name == name) {
                index = i;
            }
        }
        if (index==null) {
            list.push({
                name: name,
                title: title,
                address: address, 
                creator: creator
            });
        } else {
            list[index].name=name;
            list[index].title=title;
            list[index].address=address;
        }

        this.saveList(list);
    
    }
    
    itemExists(name) {
        let list = this.getList();
        for (let item of list) {
            if (item.name == name) {
                return true;
            }
        }
        return false;
    }
    refresh() {
        this.writeHtml();
    }
    writeHtml() {
        let list = this.getList();

        this.jquerySelectorObj.html('<table class="table"><tbody></tbody></table>');
    
        var tbody = this.jquerySelectorObj.find('table').children('tbody');
    
        if (list.length>0) {
            for (let item of list) {
                tbody.append('<tr><th>'+item.title+'</th><th>'+item.address+'</th></tr>');
            }
        } else {
            tbody.append('<tr><th>There are no data</th></tr>');
        }
    }
    
  
}

class ContractArtifacts {
    constructor() {
        
        
        this.data = {};
        this.fetchData();
        
    }
    
    fetchData() {
        var objThis = this;
        
        [
            "IWETH",
            "CommunityCoin",
            "CommunityCoinFactory",
            "CommunityRolesManagement",
            "CommunityStakingPool",
            "CommunityStakingPoolErc20",
            "CommunityStakingPoolFactory",
            "TestITRc",
            "UniswapV2Factory",
            "UniswapV2Pair",
            "UniswapV2Router02"
        ].forEach(function(fname){
            
            fetch('artifacts/'+fname+'.json')
            .then(response => response.text())
            .then( async function(text){
                text = JSON.parse(text);
                objThis.data[fname] = {};
                objThis.data[fname]['abi'] = text.abi;
                objThis.data[fname]['bytecode'] = text.bytecode;
            });
        })
        
    }
    
    getAbi(key) {
        if (typeof(this.data[key]) !== 'undefined') {
            return this.data[key]['abi'];
        } else {
            throw 'unknown key';
        }
    }
    getBytecode(key) {
        if (typeof(this.data[key]) !== 'undefined') {
            return this.data[key]['bytecode'];
        } else {
            throw 'unknown key';
        }
    }
}

function fillZeroAddress(id) {
    $(id).val('0x0000000000000000000000000000000000000000');
}
function fillOneEth(id) {
    $(id).val('1000000000000000000');
}

function fillCurrentAddress(id) {
    if (provider && provider.selectedAddress) {
        $(id).val(provider.selectedAddress);
    }
}

function fillFromStorage(id, key, name, attr) {
    let st = new ContractStorage(key);
    if (st.itemExists(name)) {
        let t = st.getItem(name);
        $(id).val(t[attr]);
    }
}


function createModalBootstrap(title) {
    let $modal, $modalHeader,$modalBody, $modalFooter;
    if ($('#staticModalBackdrop').length>0) {
        $modal = $('#staticModalBackdrop');
        $modalHeader = $('#staticModalHead');
        $modalBody = $('#staticModalBody');
        $modalFooter = $('#staticModalFooter');
        
        $modalBody.html('');
        $modalHeader.find('#staticBackdropLabel').html(title);
    } else {
        $modalHeader = $('<div/>').addClass("modal-header").attr('id', 'staticModalHead');
        $modalHeader.html('<h5 class="modal-title" id="staticBackdropLabel">'+title+'</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

        $modalBody = $('<div/>').addClass("modal-body").attr('id', 'staticModalBody');

        $modalFooter = $('<div/>').addClass("modal-footer").attr('id', 'staticModalFooter');
        $modalFooter.html('<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>');

        let $modalDialog = $('<div/>').addClass("modal-dialog").addClass('modal-dialog-centered');
        $modal = $('<div class="modal fade" id="staticModalBackdrop" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true"></div>');
        //let $modal = $('<div/>');

        let $modalContent = $('<div/>').addClass("modal-content").append($modalHeader).append($modalBody).append($modalFooter);

    //alert($modalDialog.html());    
        $modalContent.appendTo($modalDialog);
    //alert($modalDialog.html());
        $modalDialog.appendTo($modal);
    //alert($modal.html());
        $modal.appendTo('body');
    }
    return [$modal, $modalHeader, $modalBody, $modalFooter];
    /*
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Understood</button>
      </div>
    </div>
    */
}