class TabUsers {
    constructor() {
        
        this.contractStorageObj = new ContractStorage(
            "users",
            $("#tabUsers .jsDeployedList")
        );

        this.setupHandlers();
        
        this.refresh();
    }
    refresh() {
        this.fillSelect();
        
        this.contractStorageObj.refresh();
    }
    fillSelect() {
        let obj = $("#tabUsers select.selectTemplate");
        
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
            $("#tabPools .tab-templateContent").hide();
            $("#tabPools .tab-"+this.value).show();

        }).trigger('change');

        $('#tabUsers .tab-templateContent button').off("click").on("click", async function(e){
            e.preventDefault();


            obj.contractStorageObj.refresh();
        });
    }
}



