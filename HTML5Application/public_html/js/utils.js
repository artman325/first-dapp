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
        this.msToRefresh = 1000;
        this.provider = null;
        this.loopCondition = true;
        this.isRefreshingNow = false;
        
        this.loop();
    }
    
    changedProvider(provider) {
        console.log("BalancesBlock::changedProvider");
        this.provider = provider;
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
        
        let blockNumber;
        
        if (this.provider && this.provider.selectedAddress) {
            blockNumber = Date.now();
        } else {
            blockNumber = '--';
        }
        //synth delay
        //await this.delay(4000);
        
        this.blockNumberObj.html(blockNumber);
        
        ////////////////////////////
        this.isRefreshingNow = false;
    }
    
    async loop() {
        while (this.loopCondition) {
            /* code to wait on goes here (sync or async) */    
            await this._refresh();
            await this.delay(this.msToRefresh)
        }
    }
}

class ContractStorage {
    
    constructor(key, jquerySelectorObj) {
        this.key = key;
        this.jquerySelectorObj = jquerySelectorObj;
    }
    
    clear() {
        localStorage.setItem(this.key, JSON.stringify([]));
    }

    getList() {
        let list = localStorage.getItem(this.key);
        list = (typeof(list) === 'undefined' || list == null) ? [] : JSON.parse(list);
        return list;
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
        
        localStorage.setItem(this.key, JSON.stringify(list));
    
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


function fillZeroAddress(id) {
    $(id).val('0x0000000000000000000000000000000000000000');
}
function fillFromStorage(id, key, name, attr) {
    let st = new ContractStorage(key);
    if (st.itemExists(name)) {
        let t = st.getItem(name);
        $(id).val(t[attr]);
    }
}
