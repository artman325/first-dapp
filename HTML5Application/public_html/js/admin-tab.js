/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function refreshDeployedImplementations(){

    let list = localStorage.getItem("deployedImplementations");
    list = (typeof(list) === 'undefined' || list == null) ? [] : JSON.parse(list);
    $('#adminTabDeployedList').html('<table class="table"><tbody></tbody></table>');
    
    //Try to get tbody first with jquery children. works faster!
    var tbody = $('#adminTabDeployedList table').children('tbody');
    console.log(list);
    if (list.length>0) {
        for (let item of list) {
            tbody.append('<tr><th>'+item.name+'</th><th>'+item.address+'</th></tr>');
        }
    } else {
        tbody.append('<tr><th>There are no data</th></tr>');
    }

}

function saveImplementation(name, address) {
    let list = localStorage.getItem("deployedImplementations");
    list = (typeof(list) === 'undefined' || list == null) ? [] : JSON.parse(list);
    list.push({
        name: name,
        address: address
    });
    localStorage.setItem("deployedImplementations", JSON.stringify(list));
    
}


    
async function test() {
    
}

$("#JsDeployedListRefresh").off("click").on("click", function(){
    refreshDeployedImplementations();
});
$("#AdminPage-selectTemlate").off("change").on("change", function(){
    $(".AdminPage-templateContent").hide();
    $(".AdminPage-"+this.value).show();
     
}).trigger('change');

$('.adminPageContainer button').off("click").on("click", function(e){
    e.preventDefault();
    let option = $("#AdminPage-selectTemlate").val();
    if (provider.selectedAddress != null) {
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

                saveImplementation(option, contract.address);
                fetchAccountData();
                refreshDeployedImplementations();
//                console.log(provider.selectedAddress);
//                const signer = await ethers.provider.getSigner(provider.selectedAddress)
    //            signer.sendTransaction(...) // what does this do?
            });
    }
});

refreshDeployedImplementations();
  // outputs the content of the text file

//saveImplementation("lorem", 0x123);
//saveImplementation("dolor", 0x456);