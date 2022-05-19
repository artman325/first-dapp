
//tabs
var tabUsers = new TabUsers();
var tabPools = new TabPools();
var tabFactories = new TabFactories();
var tabAdmins = new TabAdmins();



function tabActivate(tab){
    $('.nav-tabs a[href="' + tab + '"]').trigger('click');
};
$('.nav-tabs a').off('click').on('click', function(){
    console.log('clicked');
    console.log($(this).attr('href'));
    
    let href = $(this).attr('href');
    localStorage.setItem("currentTab", href);
    let objectName = href.replace('#','');
    eval(objectName+".refresh()");
    
});

function tabsRefresh() {
    tabUsers.refresh();
    tabPools.refresh();
    tabFactories.refresh();
    tabAdmins.refresh();
}  

var currentTab = localStorage.getItem("currentTab");
console.log("currentTab start");
console.log(currentTab);
if (typeof currentTab !== "undefined") {
    tabActivate(currentTab);
}
