function tabActivate(tab){
    $('.nav-tabs a[href="' + tab + '"]').tab('show');
};
$('.nav-tabs a').off('click').on('click', function(){
    console.log('clicked');
    console.log($(this).attr('href'));
    
    localStorage.setItem("currentTab", $(this).attr('href'));
});

var currentTab = localStorage.getItem("currentTab");
if (typeof currentTab !== "undefined") {
    tabActivate(currentTab);
}
