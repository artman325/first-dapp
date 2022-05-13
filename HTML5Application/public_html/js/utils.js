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
    setItem(name, address, creator) {
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
                address: address, 
                creator: creator
            });
        } else {
            list[index].name=name;
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
                tbody.append('<tr><th>'+item.name+'</th><th>'+item.address+'</th></tr>');
            }
        } else {
            tbody.append('<tr><th>There are no data</th></tr>');
        }
    }
    
  
}


function fillZeroAddress(id) {
    $(id).val('0x0000000000000000000000000000000000000000');
}